import { Repository } from 'typeorm';

export function getEntityMetadata<T>(repository: Repository<T>) {
  const tableName = repository.metadata.tablePath;
  const primaryColumn = repository.metadata.primaryColumns[0].databasePath;
  const parentPropertyName =
    repository.metadata.treeParentRelation?.joinColumns[0].propertyName || '';
  const parentColumn =
    repository.metadata.treeParentRelation?.joinColumns[0].databasePath || '';

  const closureTableName = repository.metadata.closureJunctionTable?.tablePath;
  const ancestorColumn =
    repository.metadata.closureJunctionTable?.ancestorColumns[0].databasePath;
  const descendantColumn =
    repository.metadata.closureJunctionTable?.descendantColumns[0].databasePath;

  return {
    tableName,
    primaryColumn,
    parentPropertyName,
    parentColumn,
    closureTableName,
    ancestorColumn,
    descendantColumn,
  };
}
