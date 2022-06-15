package com.ulca.benchmark.download.kafka.listener;

import java.io.FileOutputStream;
import java.io.IOException;
import java.net.URL;
import java.nio.channels.Channels;
import java.nio.channels.ReadableByteChannel;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import com.ulca.benchmark.dao.BenchmarkDao;
import com.ulca.benchmark.dao.BenchmarkProcessDao;
import com.ulca.benchmark.dao.BenchmarkTaskTrackerDao;
import com.ulca.benchmark.kafka.model.BmDatasetDownload;
import com.ulca.benchmark.model.BenchmarkError;
import com.ulca.benchmark.model.BenchmarkProcess;
import com.ulca.benchmark.model.BenchmarkTaskTracker;
import com.ulca.benchmark.service.AsrBenchmark;
import com.ulca.benchmark.service.BmProcessTrackerService;
import com.ulca.benchmark.service.NotificationService;
import com.ulca.benchmark.service.OcrBenchmark;
import com.ulca.benchmark.service.TranslationBenchmark;
import com.ulca.benchmark.service.TransliterationBenchmark;
import com.ulca.benchmark.util.UnzipUtility;
import com.ulca.model.dao.ModelDao;
import com.ulca.model.dao.ModelExtended;

import io.swagger.model.Benchmark;
import io.swagger.model.ModelTask;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class KafkaBenchmarkDownloadConsumer {

	@Autowired
	UnzipUtility unzipUtility;

	@Value("${ulca.bm.ds.download.folder}")
	private String bmDsDownloadFolder;

	@Autowired
	ModelDao modelDao;

	@Autowired
	BenchmarkDao benchmarkDao;
	
	@Autowired
	BenchmarkTaskTrackerDao benchmarkTaskTrackerDao;
	
	@Autowired
	BmProcessTrackerService bmProcessTrackerService;

	@Autowired
	BenchmarkProcessDao benchmarkProcessDao;

	@Autowired
	TranslationBenchmark translationBenchmark;
	
	@Autowired
	TransliterationBenchmark transliterationBenchmark;
	
	@Autowired
	AsrBenchmark asrBenchmark;
	
	@Autowired
	OcrBenchmark ocrBenchmark;
	
	@Autowired
	NotificationService notificationService;

	@KafkaListener(groupId = "${kafka.ulca.bm.filedownload.ip.topic.group.id}", topics = "${kafka.ulca.bm.filedownload.ip.topic}", containerFactory = "benchmarkDownloadKafkaListenerContainerFactory")
	public void downloadBenchmarkDataset(BmDatasetDownload bmDsDownload) {

		log.info("************ Entry KafkaBenchmarkDownloadConsumer :: downloadBenchmarkDataset *********");

		try {

			String benchmarkProcessId = bmDsDownload.getBenchmarkProcessId();
			
			List<BenchmarkTaskTracker> list = benchmarkTaskTrackerDao.findByBenchmarkProcessId(benchmarkProcessId);
			
			if(list.size() > 0) {
				log.info("Duplicate Benchmark Process. Skipping Benchamrk Processing. benchmarkProcessId :: " + benchmarkProcessId);
				return;
			}
			bmProcessTrackerService.createTaskTracker(benchmarkProcessId, BenchmarkTaskTracker.ToolEnum.download, BenchmarkTaskTracker.StatusEnum.inprogress);
			
			String downloadFolder = bmDsDownloadFolder + "/benchmark-dataset";
			
			Path targetLocation = Paths.get(downloadFolder).toAbsolutePath().normalize();

			try {
				Files.createDirectories(targetLocation);
			} catch (Exception ex) {
				BenchmarkError error = new BenchmarkError();
				error.setCause(ex.getMessage());
				error.setMessage("file download failed");
				error.setCode("2000_FILE_DOWNLOAD_FAILURE");
				bmProcessTrackerService.updateTaskTrackerWithErrorAndEndTime(benchmarkProcessId, BenchmarkTaskTracker.ToolEnum.download, BenchmarkTaskTracker.StatusEnum.failed, error);
				bmProcessTrackerService.updateBmProcess(benchmarkProcessId, "Failed");
				throw new Exception("Could not create the directory where the benchmark-dataset downloaded files will be stored.", ex);
			}
			

			BenchmarkProcess bmProcess = benchmarkProcessDao.findByBenchmarkProcessId(benchmarkProcessId);
			int datasetRecordCount = 0;
			
			if(bmProcess != null) {

				String bmDatasetId = bmProcess.getBenchmarkDatasetId();
				String fileName = benchmarkProcessId + ".zip";

				String modelId = bmProcess.getModelId();
				Optional<ModelExtended> modelOpt = modelDao.findById(modelId);
				ModelExtended model = modelOpt.get();

				Optional<Benchmark> benchmarkOpt = benchmarkDao.findById(bmDatasetId);
				Benchmark benchmark = benchmarkOpt.get();
				String datasetUrl = benchmark.getDataset();
				
				Map<String, String> fileMap = null;
				
				try {
					String filePath = downloadUsingNIO(datasetUrl, downloadFolder, fileName);

					log.info("filePath :: " + filePath);
					
					String serviceRequestNumber = benchmarkProcessId ;
					
					log.info("serviceRequestNumber :: " + serviceRequestNumber);
					
					fileMap = unzipUtility.unzip(filePath, downloadFolder, serviceRequestNumber);
					
					bmProcessTrackerService.updateTaskTracker(benchmarkProcessId, BenchmarkTaskTracker.ToolEnum.download, BenchmarkTaskTracker.StatusEnum.completed);
					
				}catch (IOException e) {
					log.info("Benchmark Process Failed. benchmarkProcessId :: "  + benchmarkProcessId + " cause :: " + e.getMessage());
					
					BenchmarkError error = new BenchmarkError();
					error.setCause(e.getMessage());
					error.setMessage("file download failed");
					error.setCode("2000_FILE_DOWNLOAD_FAILURE");
					bmProcessTrackerService.updateTaskTrackerWithErrorAndEndTime(benchmarkProcessId, BenchmarkTaskTracker.ToolEnum.download, BenchmarkTaskTracker.StatusEnum.failed, error);
					bmProcessTrackerService.updateBmProcess(benchmarkProcessId, "Failed");
					notificationService.notifyBenchmarkFailed(modelId,  model.getName(), model.getUserId());
					
					return;
				}

				try {
					
					bmProcessTrackerService.createTaskTracker(benchmarkProcessId, BenchmarkTaskTracker.ToolEnum.ingest, BenchmarkTaskTracker.StatusEnum.inprogress);
					bmProcessTrackerService.createTaskTracker(benchmarkProcessId, BenchmarkTaskTracker.ToolEnum.benchmark, BenchmarkTaskTracker.StatusEnum.inprogress);
					
					ModelTask.TypeEnum type = model.getTask().getType();

					switch (type) {
					case TRANSLATION:
						log.info("modelTaskType :: " + ModelTask.TypeEnum.TRANSLATION.toString());
						
						datasetRecordCount = translationBenchmark.prepareAndPushToMetric(model, benchmark, fileMap, bmProcess.getMetric(),
								benchmarkProcessId);
						bmProcess.setRecordCount(datasetRecordCount);
						
						break;
					case ASR:
						log.info("modelTaskType :: " + ModelTask.TypeEnum.ASR.toString());
						
						datasetRecordCount = asrBenchmark.prepareAndPushToMetric(model, benchmark, fileMap, bmProcess.getMetric(),
								benchmarkProcessId);
						bmProcess.setRecordCount(datasetRecordCount);
						
						break;

					case OCR:

						log.info("modelTaskType :: " + ModelTask.TypeEnum.OCR.toString());
						
						datasetRecordCount = ocrBenchmark.prepareAndPushToMetric(model, benchmark, fileMap, bmProcess.getMetric(),
								benchmarkProcessId);
						bmProcess.setRecordCount(datasetRecordCount);
						
						break;
						
					case TRANSLITERATION:

						log.info("modelTaskType :: " + ModelTask.TypeEnum.TRANSLITERATION.toString());
						
						datasetRecordCount = transliterationBenchmark.prepareAndPushToMetric(model, benchmark, fileMap, bmProcess.getMetric(),
								benchmarkProcessId);
						bmProcess.setRecordCount(datasetRecordCount);
						
						break;

					default:

						break;

					}

					bmProcessTrackerService.updateTaskTracker(benchmarkProcessId, BenchmarkTaskTracker.ToolEnum.ingest, BenchmarkTaskTracker.StatusEnum.completed);
					benchmarkProcessDao.save(bmProcess);
					
				} catch (Exception e) {
					
					log.info("Benchmark Process Failed. benchmarkProcessId :: "  + benchmarkProcessId + " cause :: " + e.getMessage());
					
					BenchmarkError error = new BenchmarkError();
					error.setCause(e.getMessage());
					error.setMessage("Benchmark Ingest Failed");
					error.setCode("2000_BENCHMARK_INGEST_FAILURE");
					bmProcessTrackerService.updateTaskTrackerWithErrorAndEndTime(benchmarkProcessId, BenchmarkTaskTracker.ToolEnum.ingest, BenchmarkTaskTracker.StatusEnum.failed, error);
					bmProcessTrackerService.updateBmProcess(benchmarkProcessId, "Failed");
					notificationService.notifyBenchmarkFailed(modelId,  model.getName(), model.getUserId());
					e.printStackTrace();
					
				}

			
			} else {
				log.info("Benchmark Process Not Found. benchmarkProcessId :: "  + benchmarkProcessId);
			}

		} catch (Exception ex) {
			log.info("error in listener");
			ex.printStackTrace();
		}

	}

	private String downloadUsingNIO(String urlStr, String downloadFolder, String fileName) throws IOException {
		log.info("************ Entry KafkaBenchmarkDownloadConsumer :: downloadUsingNIO *********");
		URL url = new URL(urlStr);
		String file = downloadFolder + "/" + fileName;
		log.info("file path in downloadUsingNIO");
		log.info(file);
		log.info(url.getPath());
		ReadableByteChannel rbc = Channels.newChannel(url.openStream());
		log.info(url.getContent().toString());
		log.info(rbc.getClass().toString());
		FileOutputStream fos = new FileOutputStream(file);
		fos.getChannel().transferFrom(rbc, 0, Long.MAX_VALUE);
		fos.close();
		rbc.close();

		log.info("************ Exit KafkaBenchmarkDownloadConsumer :: downloadUsingNIO *********");
		return file;
	}

}
