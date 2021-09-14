package com.ulca.model.response;

import java.util.List;
import com.ulca.model.request.ModelLeaderboardRequest;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ModelLeaderboardResponse {

	String message;
	List<ModelLeaderboardRequest> data;
	int count;
	
	
	
}
