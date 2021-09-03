package com.ulca.benchmark.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

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
	int score;
	String metric;
	String status;

}
