package com.ulca.model.dao;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;
import com.ulca.model.request.ModelLeaderboardRequest;


@Repository
public interface ModelDao extends MongoRepository<ModelExtended, String> {

	Page<ModelExtended> findByUserId(String userId, Pageable paging);

	List<ModelExtended> findByUserId(String userId);
//	@Query(SELECT bm.modelId FROM BenchmarkProcess p INNERJOIN ModelExtended as m ON (m.modelId=bm.modelId)"
//			+ "WHERE LOWER(bm.score) = LOWER(?1)"))
    @Query("{score : {$lt : ?0, $gt : ?10}}")
	List<ModelLeaderboardRequest> findModelByScore(double score);

   
}
