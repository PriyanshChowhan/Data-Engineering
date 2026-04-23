const { performance } = require("node:perf_hooks");
const { getAllQueryMetadata, getQueryDefinition } = require("../utils/queryCatalog");

const formatQueryResponse = async (queryDefinition) => {
  const startTime = performance.now();
  const executionResult = await queryDefinition.execute();
  const executionTime = Number((performance.now() - startTime).toFixed(2));

  return {
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
  };
};  

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

    return res.json(await formatQueryResponse(queryDefinition));
  } catch (error) {
    return next(error);
  }
};

exports.getInsightQueries = async (req, res, next) => {
  try {
    const insightQueryIds = ["Q1", "Q2", "Q3", "Q4", "Q5", "Q6"];
    const insights = [];

    for (const queryId of insightQueryIds) {
      const queryDefinition = getQueryDefinition(queryId);

      if (!queryDefinition) {
        continue;
      }

      insights.push(await formatQueryResponse(queryDefinition));
    }

    return res.json({
      success: true,
      data: insights
    });
  } catch (error) {
    return next(error);
  }
};
