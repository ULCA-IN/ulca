package com.ulca.benchmark.request;

import io.swagger.model.Domain;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Data
@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class BenchmarkListByModelRequest {
	
  // private String task ;
  // private Domain domain ;
   private String modelId;
   

}
