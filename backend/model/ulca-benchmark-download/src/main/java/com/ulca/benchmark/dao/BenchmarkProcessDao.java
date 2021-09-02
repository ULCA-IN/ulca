package com.ulca.benchmark.dao;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.ulca.benchmark.model.BenchmarkProcess;

import io.swagger.model.Benchmark;

@Repository
public interface BenchmarkProcessDao extends MongoRepository<BenchmarkProcess, String> {

	List<BenchmarkProcess> findByBenchmarkProcessId(String benchmarkProcessId);

}
