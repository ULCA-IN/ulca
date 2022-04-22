package com.ulca.dataset.kakfa;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.channels.FileChannel;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.core.JsonParseException;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.module.SimpleModule;
import com.google.gson.Gson;
import com.google.gson.stream.JsonReader;
import com.ulca.dataset.dao.TaskTrackerRedisDao;
import com.ulca.dataset.kakfa.model.DatasetIngest;
import com.ulca.dataset.model.Error;
import com.ulca.dataset.model.ProcessTracker.StatusEnum;
import com.ulca.dataset.model.TaskTracker.ToolEnum;
import com.ulca.dataset.model.deserializer.OcrDatasetParamsSchemaDeserializer;
import com.ulca.dataset.model.deserializer.OcrDatasetRowDataSchemaDeserializer;
import com.ulca.dataset.service.DatasetService;
import com.ulca.dataset.service.NotificationService;
import com.ulca.dataset.service.ProcessTaskTrackerService;

import io.swagger.model.DatasetType;
import io.swagger.model.OcrDatasetParamsSchema;
import io.swagger.model.OcrDatasetRowSchema;
import io.swagger.model.ParallelDatasetParamsSchema;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class DatasetOcrValidateIngest implements DatasetValidateIngest {

	@Autowired
	ProcessTaskTrackerService processTaskTrackerService;

	@Autowired
	DatasetErrorPublishService datasetErrorPublishService;

	@Autowired
	private KafkaTemplate<String, String> datasetValidateKafkaTemplate;

	@Value("${kafka.ulca.ds.validate.ip.topic}")
	private String validateTopic;
	
	@Value("${precheck.ingest.sample.size}")
	private Integer precheckSampleSize;
	
	@Value("${precheck.ingest.record.threshold}")
	private Integer precheckRecordThreshold;

	@Autowired
	DatasetService datasetService;
	
	@Autowired
	NotificationService notificationService;
	
	@Autowired
	TaskTrackerRedisDao taskTrackerRedisDao;
	
	public void validateIngest(DatasetIngest datasetIngest) {

		log.info("************ Entry DatasetOcrValidateIngest :: validateIngest *********");
		String serviceRequestNumber = datasetIngest.getServiceRequestNumber();
		String datasetName = datasetIngest.getDatasetName();
		DatasetType datasetType = datasetIngest.getDatasetType();
		String userId = datasetIngest.getUserId();
		String datasetId = datasetIngest.getDatasetId();
		String md5hash = datasetIngest.getMd5hash();
		String baseLocation = datasetIngest.getBaseLocation();
		String mode = datasetIngest.getMode();
		
		
		OcrDatasetParamsSchema paramsSchema = null;
		
		Error fileError = validateFileExistence(baseLocation);
		
		if (fileError != null) {
			
			log.info("params.json or data.json file missing :: serviceRequestNumber :"+serviceRequestNumber );
			
			processTaskTrackerService.updateTaskTrackerWithErrorAndEndTime(serviceRequestNumber, ToolEnum.ingest,
					com.ulca.dataset.model.TaskTracker.StatusEnum.failed, fileError);
			
			processTaskTrackerService.updateProcessTracker(serviceRequestNumber, StatusEnum.failed);
			//send error event for download failure
			datasetErrorPublishService.publishDatasetError("dataset-training", fileError.getCode(), fileError.getMessage(), serviceRequestNumber, datasetName,"download" , datasetType.toString(), null) ;
			
			//notify failed dataset submit
			notificationService.notifyDatasetFailed(serviceRequestNumber, datasetName, userId);
			
			return;
		}
	
		
		try {
			
			paramsSchema = validateParamsSchema(datasetIngest);

		} catch (Exception e) {
			log.info("Exception while validating params :: serviceRequestNumber : "+serviceRequestNumber + " error : " + e.getMessage());
			Error error = new Error();
			error.setCause(e.getMessage());
			error.setMessage("params validation failed");
			error.setCode("1000_PARAMS_VALIDATION_FAILED");

			processTaskTrackerService.updateTaskTrackerWithErrorAndEndTime(serviceRequestNumber, ToolEnum.ingest,
					com.ulca.dataset.model.TaskTracker.StatusEnum.failed, error);
			
			processTaskTrackerService.updateProcessTracker(serviceRequestNumber, StatusEnum.failed);

			// send error event
			datasetErrorPublishService.publishDatasetError("dataset-training","1000_PARAMS_VALIDATION_FAILED", e.getMessage(), serviceRequestNumber, datasetName,"ingest" , datasetType.toString(),null) ;

			//notify failed dataset submit
			notificationService.notifyDatasetFailed(serviceRequestNumber, datasetName, userId);
			
			return;
		}
		
				
		try {
			if(mode.equalsIgnoreCase("real")) {
				updateDataset(datasetId, userId, md5hash,paramsSchema);
				ingest(paramsSchema, datasetIngest);
			}else {
				initiateIngest(datasetId, userId, md5hash,paramsSchema, datasetIngest);
			}

		} catch (Exception e) {

			log.info("Exception while ingesting :: serviceRequestNumber : "+serviceRequestNumber + " error : " + e.getMessage());
			
			Error error = new Error();
			error.setCause(e.getMessage());
			error.setMessage("INGEST FAILED");
			error.setCode("1000_INGEST_FAILED");

			processTaskTrackerService.updateTaskTrackerWithError(serviceRequestNumber, ToolEnum.ingest,
					com.ulca.dataset.model.TaskTracker.StatusEnum.failed, error);

			processTaskTrackerService.updateProcessTracker(serviceRequestNumber, StatusEnum.failed);

			// send error event
			datasetErrorPublishService.publishDatasetError("dataset-training","1000_INGEST_FAILED", e.getMessage(), serviceRequestNumber, datasetName,"ingest" , datasetType.toString(),null) ;
			//update redis when ingest failed
			taskTrackerRedisDao.updateCountOnIngestFailure(serviceRequestNumber);
			
			//notify failed dataset submit
			notificationService.notifyDatasetFailed(serviceRequestNumber, datasetName, userId);
			
			return;
		}
	}

	public OcrDatasetParamsSchema validateParamsSchema(DatasetIngest datasetIngest)
			throws JsonParseException, JsonMappingException, IOException {
		
		String paramsFilePath = datasetIngest.getBaseLocation()  + File.separator + "params.json";

		log.info("************ Entry DatasetAsrValidateIngest :: validateParamsSchema *********");
		log.info("validing file :: against params schema");
		log.info(paramsFilePath);
		String serviceRequestNumber = datasetIngest.getServiceRequestNumber();
		log.info(serviceRequestNumber);
		ObjectMapper mapper = new ObjectMapper();
		SimpleModule module = new SimpleModule();
		module.addDeserializer(OcrDatasetParamsSchema.class, new OcrDatasetParamsSchemaDeserializer());
		mapper.registerModule(module);

		OcrDatasetParamsSchema paramsSchema = mapper.readValue(new File(paramsFilePath), OcrDatasetParamsSchema.class);
		if (paramsSchema == null) {
			log.info("params validation failed");
			throw new IOException("paramsValidation failed");
		}
		return paramsSchema;
	}

	public void ingest(OcrDatasetParamsSchema paramsSchema, DatasetIngest datasetIngest)
			throws IOException {

		log.info("************ Entry DatasetOcrValidateIngest :: ingest *********");

		String datasetId = datasetIngest.getDatasetId();
		String serviceRequestNumber = datasetIngest.getServiceRequestNumber();
		String userId = datasetIngest.getUserId();
		String datasetName = datasetIngest.getDatasetName();
		String mode = datasetIngest.getMode();
		DatasetType datasetType = datasetIngest.getDatasetType();


		log.info("got paramsSchema object");

		ObjectMapper objectMapper = new ObjectMapper();

		JSONObject source;
		
		String path = datasetIngest.getBaseLocation()  + File.separator + "data.json";
		log.info("data.json file path :: " + path);

		source = new JSONObject(objectMapper.writeValueAsString(paramsSchema));

		InputStream inputStream = Files.newInputStream(Path.of(path));
		JsonReader reader = new JsonReader(new InputStreamReader(inputStream));


		int numberOfRecords = 0;
		int failedCount = 0;
		int successCount = 0;
		
		JSONObject vModel = new JSONObject();
		vModel.put("datasetId", datasetId);
		vModel.put("datasetName", datasetName);
		vModel.put("datasetType", paramsSchema.getDatasetType().toString());
		vModel.put("serviceRequestNumber", serviceRequestNumber);
		vModel.put("userId", userId);
		vModel.put("userMode", mode);
		
		taskTrackerRedisDao.intialize(serviceRequestNumber, datasetName, userId);
		log.info("starting to ingest serviceRequestNumber :: " + serviceRequestNumber);
		
		String basePath  = datasetIngest.getBaseLocation()  + File.separator;
		
		reader.beginArray();
		
		while (reader.hasNext()) {

			numberOfRecords++;
			
			Object rowObj = new Gson().fromJson(reader, Object.class);
			ObjectMapper mapper = new ObjectMapper();
			String dataRow = mapper.writeValueAsString(rowObj);
			SimpleModule module = new SimpleModule();
			module.addDeserializer(OcrDatasetRowSchema.class, new OcrDatasetRowDataSchemaDeserializer());
			mapper.registerModule(module);
			
			OcrDatasetRowSchema rowSchema = null;
			try {
				
				rowSchema = mapper.readValue(dataRow, OcrDatasetRowSchema.class);
				
			} catch(Exception e) {
				
				failedCount++;
				taskTrackerRedisDao.increment(serviceRequestNumber, "ingestError");
				
				// send error event
				datasetErrorPublishService.publishDatasetError("dataset-training","1000_ROW_DATA_VALIDATION_FAILED", e.getMessage(), serviceRequestNumber, datasetName,"ingest" , datasetType.toString(),dataRow) ;
				
				log.info("record :: " +numberOfRecords + "failed " );
				log.info("tracing the error " );
				e.printStackTrace();
				
				
			}
			if(rowSchema != null) {
				
				JSONObject target =  new JSONObject(dataRow);
				JSONObject finalRecord = deepMerge(source, target);
				String sourceLanguage = finalRecord.getJSONObject("languages").getString("sourceLanguage");
				finalRecord.remove("languages");
				finalRecord.put("sourceLanguage", sourceLanguage);
				
				String fileLocation = basePath + finalRecord.get("imageFilename");
				
				if(isFileAvailable(fileLocation)) {
					taskTrackerRedisDao.increment(serviceRequestNumber, "ingestSuccess");
					successCount++;
					finalRecord.put("fileLocation", fileLocation);
					UUID uid = UUID.randomUUID();
					finalRecord.put("id", uid);

					vModel.put("record", finalRecord);
					vModel.put("currentRecordIndex", numberOfRecords);

					datasetValidateKafkaTemplate.send(validateTopic, vModel.toString());
					
				}else {
					failedCount++;
					taskTrackerRedisDao.increment(serviceRequestNumber, "ingestError");
					
					// send error event
					datasetErrorPublishService.publishDatasetError("dataset-training","1000_ROW_DATA_VALIDATION_FAILED", finalRecord.get("imageFilename")+ " Not available ", serviceRequestNumber, datasetName,"ingest" , datasetType.toString(), dataRow) ;
					
				}

				
				
			}

		}
		reader.endArray();
		reader.close();
		inputStream.close();

		taskTrackerRedisDao.setCountOnIngestComplete(serviceRequestNumber, numberOfRecords);
		
		log.info("data sending for validation serviceRequestNumber :: " + serviceRequestNumber + " total Record :: " + numberOfRecords + " success record :: " + successCount) ;
		
	}
	
	public void pseudoIngest(OcrDatasetParamsSchema paramsSchema, DatasetIngest datasetIngest, long recordSize)
			throws IOException {

		log.info("************ Entry DatasetOcrValidateIngest :: pseudoIngest *********");

		String datasetId = datasetIngest.getDatasetId();
		String serviceRequestNumber = datasetIngest.getServiceRequestNumber();
		String userId = datasetIngest.getUserId();
		String datasetName = datasetIngest.getDatasetName();
		String mode = datasetIngest.getMode();
		String baseLocation = datasetIngest.getBaseLocation();
		String md5hash = datasetIngest.getMd5hash();
		DatasetType datasetType = datasetIngest.getDatasetType();
		
		ObjectMapper objectMapper = new ObjectMapper();
		JSONObject source = new JSONObject(objectMapper.writeValueAsString(paramsSchema));
		
		String dataFilePath = datasetIngest.getBaseLocation()  + File.separator + "data.json";
		
		InputStream inputStream = Files.newInputStream(Path.of(dataFilePath));
		JsonReader reader = new JsonReader(new InputStreamReader(inputStream));
		
		JSONObject vModel = new JSONObject();
		vModel.put("datasetId", datasetId);
		vModel.put("datasetName", datasetName);
		vModel.put("datasetType", paramsSchema.getDatasetType().toString());
		vModel.put("serviceRequestNumber", serviceRequestNumber);
		vModel.put("userId", userId);
		vModel.put("userMode", mode);
		
		taskTrackerRedisDao.intializePrecheckIngest(serviceRequestNumber,baseLocation, md5hash, paramsSchema.getDatasetType().toString(),datasetName, datasetId, userId);
		log.info("Starting pseudoIngest serviceRequestNumber :: " + serviceRequestNumber);
		
		int numberOfRecords = 0;
		int failedCount = 0;
		int successCount = 0;
		int pseudoNumberOfRecords = 0;
		
		long sampleSize = recordSize/10;
		long bufferSize = precheckSampleSize/10;
		
		long base = sampleSize;
		long counter = 0;
		long maxCounter = bufferSize;
		
		String basePath  = datasetIngest.getBaseLocation()  + File.separator;
		reader.beginArray();
		while (reader.hasNext()) {
			
			numberOfRecords++;
			
			if(counter < maxCounter ) {
				
				pseudoNumberOfRecords++;
				++counter;	
				
				Object rowObj = new Gson().fromJson(reader, Object.class);
				ObjectMapper mapper = new ObjectMapper();
				String dataRow = mapper.writeValueAsString(rowObj);
				SimpleModule module = new SimpleModule();
				module.addDeserializer(OcrDatasetRowSchema.class, new OcrDatasetRowDataSchemaDeserializer());
				mapper.registerModule(module);
				
				OcrDatasetRowSchema rowSchema = null;
				try {
					
					rowSchema = mapper.readValue(dataRow, OcrDatasetRowSchema.class);
					
				} catch(Exception e) {
					
					failedCount++;
					taskTrackerRedisDao.increment(serviceRequestNumber, "ingestError");
					
					// send error event
					datasetErrorPublishService.publishDatasetError("dataset-training","1000_ROW_DATA_VALIDATION_FAILED", e.getMessage(), serviceRequestNumber, datasetName,"ingest" , datasetType.toString(), dataRow) ;
					
					log.info("record :: " +numberOfRecords + "failed " );
					log.info("tracing the error " );
					e.printStackTrace();
				}
				if(rowSchema != null) {
					
					JSONObject target =  new JSONObject(dataRow);
					JSONObject finalRecord = deepMerge(source, target);
					String sourceLanguage = finalRecord.getJSONObject("languages").getString("sourceLanguage");
					finalRecord.remove("languages");
					finalRecord.put("sourceLanguage", sourceLanguage);
					
					String fileLocation = basePath + finalRecord.get("imageFilename");
					
					if(isFileAvailable(fileLocation)) {
						taskTrackerRedisDao.increment(serviceRequestNumber, "ingestSuccess");
						successCount++;
						finalRecord.put("fileLocation", fileLocation);
						UUID uid = UUID.randomUUID();
						finalRecord.put("id", uid);

						vModel.put("record", finalRecord);
						vModel.put("currentRecordIndex", pseudoNumberOfRecords);

						datasetValidateKafkaTemplate.send(validateTopic, vModel.toString());
						
					}else {
						failedCount++;
						taskTrackerRedisDao.increment(serviceRequestNumber, "ingestError");
						
						// send error event
						datasetErrorPublishService.publishDatasetError("dataset-training","1000_ROW_DATA_VALIDATION_FAILED", finalRecord.get("imageFilename")+ " Not available ", serviceRequestNumber, datasetName,"ingest" , datasetType.toString(), dataRow) ;
						
						log.info("record :: " +numberOfRecords + "failed " );
					}
				}
			
			}else if ( numberOfRecords == base ){
				Object rowObj = new Gson().fromJson(reader, Object.class);
				counter = base;
				maxCounter = base + bufferSize;
				base = base + sampleSize;
			}else {
				Object rowObj = new Gson().fromJson(reader, Object.class);
			}
		}
		reader.endArray();
		reader.close();
		inputStream.close();

		taskTrackerRedisDao.setCountOnIngestComplete(serviceRequestNumber, pseudoNumberOfRecords);
		
		log.info("data sending for pseudo validation serviceRequestNumber :: " + serviceRequestNumber + " total Record :: " + pseudoNumberOfRecords + " success record :: " + successCount) ;
		
	}
	
public  long getRecordSize(String dataFilePath) throws Exception {
		
		long numberOfRecords = 0;
		InputStream inputStream;
		try {
			inputStream = Files.newInputStream(Path.of(dataFilePath));
			JsonReader reader = new JsonReader(new InputStreamReader(inputStream));
			reader.beginArray();
			while (reader.hasNext()) {
				numberOfRecords++;
				Object rowObj = new Gson().fromJson(reader, Object.class);
			}
			
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
			throw new Exception("data.json file is not proper");
			
		}
		
		return numberOfRecords;
	}

	public  void initiateIngest(String datasetId, String userId, String md5hash,OcrDatasetParamsSchema paramsSchema, DatasetIngest datasetIngest) throws Exception {
		
		log.info(" initiateIngest ");
		String dataFilePath = datasetIngest.getBaseLocation()  + File.separator + "data.json";
		
		long recordSize = getRecordSize(dataFilePath);
		
		log.info(" total record size ::  " + recordSize);
		
		if(recordSize <= precheckRecordThreshold) {
			updateDataset(datasetId, userId, md5hash, paramsSchema);
			ingest(paramsSchema, datasetIngest);
			return;
		}else {
			pseudoIngest(paramsSchema, datasetIngest, recordSize);
		}
		
	}
	
	//update the dataset
		public void updateDataset(String datasetId, String userId, String md5hash, OcrDatasetParamsSchema paramsSchema) {
			
			try {
				ObjectMapper objectMapper = new ObjectMapper();
				JSONObject record;
				record = new JSONObject(objectMapper.writeValueAsString(paramsSchema));
				datasetService.updateDataset(datasetId, userId, record,md5hash);
				
			} catch (JsonProcessingException | JSONException e) {
				
				log.info("update Dataset failed , datasetId :: " + datasetId + " reason :: " + e.getMessage());
			}
			
			
		}
		

}