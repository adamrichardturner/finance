/**
 * Base factory interface for creating entities
 */
export interface EntityFactory<
  TEntity,
  TCreateParams,
  TUpdateParams = TCreateParams,
> {
  /**
   * Create a new entity with validation
   */
  create(params: TCreateParams): TEntity

  /**
   * Create an entity from raw/API data
   */
  fromRaw(raw: unknown): TEntity

  /**
   * Update an existing entity
   */
  update(entity: TEntity, params: TUpdateParams): TEntity

  /**
   * Validate entity or creation params
   */
  validate(entityOrParams: TEntity | TCreateParams): string | null
}
