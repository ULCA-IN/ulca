package com.ulca.benchmark.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Data
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "benchmarkprocess")
public class BenchmarkProcess {

	@Id
	String id;

	String modelId;
	String benchmarkProcessId;
	String benchmarkDatasetId;
	String benchmarkDatasetName;
	String modelName;
	String modelVersion;
	double score;
	String metric;
	String status; // Completed/In-Progress/Failed
	String createdOn;
	String lastModifiedOn;
	String startTime;
	String endTime;
	Integer recordCount;

}
