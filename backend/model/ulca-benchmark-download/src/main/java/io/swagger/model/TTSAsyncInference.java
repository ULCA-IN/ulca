package io.swagger.model;

import java.util.Objects;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonCreator;
import io.swagger.model.PollingRequest;
import io.swagger.model.TTSRequest;
import io.swagger.v3.oas.annotations.media.Schema;
import org.springframework.validation.annotation.Validated;
import javax.validation.Valid;
import javax.validation.constraints.*;

/**
 * TTSAsyncInference
 */
@Validated
@javax.annotation.Generated(value = "io.swagger.codegen.v3.generators.java.SpringCodegen", date = "2022-02-23T11:24:57.354Z[GMT]")


public class TTSAsyncInference  implements OneOfAsyncApiDetailsAsyncApiSchema {
  @JsonProperty("request")
  private TTSRequest request = null;

  @JsonProperty("response")
  private PollingRequest response = null;

  public TTSAsyncInference request(TTSRequest request) {
    this.request = request;
    return this;
  }

  /**
   * Get request
   * @return request
   **/
  @Schema(required = true, description = "")
      @NotNull

    @Valid
    public TTSRequest getRequest() {
    return request;
  }

  public void setRequest(TTSRequest request) {
    this.request = request;
  }

  public TTSAsyncInference response(PollingRequest response) {
    this.response = response;
    return this;
  }

  /**
   * Get response
   * @return response
   **/
  @Schema(description = "")
  
    @Valid
    public PollingRequest getResponse() {
    return response;
  }

  public void setResponse(PollingRequest response) {
    this.response = response;
  }


  @Override
  public boolean equals(java.lang.Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }
    TTSAsyncInference ttSAsyncInference = (TTSAsyncInference) o;
    return Objects.equals(this.request, ttSAsyncInference.request) &&
        Objects.equals(this.response, ttSAsyncInference.response);
  }

  @Override
  public int hashCode() {
    return Objects.hash(request, response);
  }

  @Override
  public String toString() {
    StringBuilder sb = new StringBuilder();
    sb.append("class TTSAsyncInference {\n");
    
    sb.append("    request: ").append(toIndentedString(request)).append("\n");
    sb.append("    response: ").append(toIndentedString(response)).append("\n");
    sb.append("}");
    return sb.toString();
  }

  /**
   * Convert the given object to string with each line indented by 4 spaces
   * (except the first line).
   */
  private String toIndentedString(java.lang.Object o) {
    if (o == null) {
      return "null";
    }
    return o.toString().replace("\n", "\n    ");
  }
}
