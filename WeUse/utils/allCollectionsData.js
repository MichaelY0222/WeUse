export default async function allCollectionsData(db, collectionName, whereClause = undefined) {
  const MAX_LIMIT = 20;
  let dbCollection;

  if (whereClause === undefined) {
    dbCollection = db.collection(collectionName);
  } else {
    dbCollection = db.collection(collectionName).where(whereClause);
  }

  const countResult = await dbCollection.count();
  const total = countResult.total;
  const batchTimes = Math.ceil(total / MAX_LIMIT);

  if (batchTimes === 0) {
    return {
      data: [],
      errMsg: "empty",
    };
  }

  const tasks = [];

  for (let i = 0; i < batchTimes; i++) {
    tasks.push(
      dbCollection
        .skip(i * MAX_LIMIT)
        .limit(MAX_LIMIT)
        .get()
    );
  }

  const results = await Promise.all(tasks);

  return results.reduce((acc, cur) => {
    return {
      data: acc.data.concat(cur.data),
      errMsg: acc.errMsg || cur.errMsg,
    };
  }, { data: [], errMsg: '' });
}