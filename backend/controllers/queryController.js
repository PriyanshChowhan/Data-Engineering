const { performance } = require("node:perf_hooks");
const { getAllQueryMetadata, getQueryDefinition } = require("../utils/queryCatalog");

exports.getQueries = async (req, res, next) => {
  try {
    res.json({
      success: true,
      data: getAllQueryMetadata()
    });
  } catch (error) {
    next(error);
  }
};

exports.runQuery = async (req, res, next) => {
  try {
    const queryId = req.params.queryId.toUpperCase();
    const queryDefinition = getQueryDefinition(queryId);

    if (!queryDefinition) {
      return res.status(404).json({
        success: false,
        message: `Query ${queryId} not found`
      });
    }

    const startTime = performance.now();
    const executionResult = await queryDefinition.execute();
    const executionTime = Number((performance.now() - startTime).toFixed(2));

    return res.json({
      success: true,
      query_id: queryDefinition.query_id,
      query_name: queryDefinition.query_name,
      description: queryDefinition.description,
      mongo_query_string:
        executionResult.mongo_query_string || queryDefinition.mongo_query_string,
      topics_covered: queryDefinition.topics_covered,
      lecture_reference: queryDefinition.lecture_reference,
      category: queryDefinition.category,
      result_count: executionResult.result_count,
      execution_time_ms: executionTime,
      results: executionResult.results,
      demonstrates: queryDefinition.demonstrates
    });
  } catch (error) {
    return next(error);
  }
};
