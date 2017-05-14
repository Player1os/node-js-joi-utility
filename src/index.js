// Load npm modules.
import _ from 'lodash'

// Load app modules.
import EntityNotFoundError from '#/src/common/error/entity_not_found'
import EntityExistsError from '#/src/common/error/entity_exists'

// Expose the base model object.
export default {
	// Create new models by extending the current one.
	extend(model) {
		// Setup the prototype chain.
		Object.setPrototypeOf(model, this)

		// Pass the extended model to the caller.
		return model
	},
	// All fields present in the underlying data object,
	// a parameter specifies whether this includes the primary key.
	fieldNames(isKeyIncluded) {
		const baseFieldNames = Object.keys(this.fields)
		if (isKeyIncluded) {
			baseFieldNames.push('key')
		}
		return baseFieldNames
	},
	// Create a single entity of the model.
	async create(values) {
		try {
			// TODO: Add.
			/*
			// Validate create values.
			this.createValuesValidator.validate(values);
			*/

			// Insert values into the underlying data object.
			const documents = await this.knex(this.table)
				.insert(values)
				.returning(this.fieldNames(true))

			// Return the first created document.
			return documents[0]
		} catch (err) {
			switch (err.code) {
				case '23505': {
					throw new EntityExistsError(err)
				}
				default: {
					throw err
				}
			}
		}
	},
	// Find all entities of the model matching the query.
	async find(query, options = {}) {
		// TODO: Add.
		/*
		// Validate query.
		this.queryValidator.validate(query);
		*/

		// Select values from the underlying data object.
		let knexQuery = this.knex(this.table)
			.select(this.fieldNames(true))
			.where(query || {})

		// Add an order by clause if needed.
		if (options.orderBy) {
			options.orderBy.forEach((orderByClause) => {
				knexQuery = knexQuery.orderBy(orderByClause.column, orderByClause.direction)
			})
		}

		// Execute the built query.
		const documents = await knexQuery

		// Return the result.
		return documents
	},
	// Find all entities of the model matching the query.
	async findOne(query) {
		// TODO: Add.
		/*
		// Validate query.
		this.queryValidator.validate(query);
		*/

		// Select values from the underlying data object.
		const documents = await this.knex(this.table)
			.select(this.fieldNames(true))
			.where(query || {})
			// Limit to a single row.
			.limit(1)

		// Check if at least one document was found.
		if (documents.length === 0) {
			throw new EntityNotFoundError()
		}

		// Return the first retrieved document.
		return documents[0]
	},
	// Find the count of all entities of the model matching the query.
	async count(query) {
		// TODO: Add.
		/*
		// Validate query.
		this.queryValidator.validate(query);
		*/

		// Select the count from the underlying data object.
		const result = await this.knex(this.table)
			.count()
			.where(query || {})

		// Parse the result of the count query.
		return parseInt(result[0].count, 10)
	},
	// Update all entities of the model matching the query with the supplied values.
	async update(query, values) {
		// TODO: Add.
		/*
		// Validate update values.
		this.updateValuesValidator.validate(values);

		// Validate query.
		this.queryValidator.validate(query);
		*/

		// Update values in the underlying data object.
		const documents = await this.knex(this.table)
			.update(values)
			.where(query || {})
			.returning(this.fieldNames(true))

		// Return the retrieved documents.
		return documents
	},
	// Delete all entities of the model matching the query.
	async destroy(query) {
		// TODO: Add.
		/*
		// Validate query.
		this.queryValidator.validate(query);
		*/

		// Delete rows from the underlying data object.
		const documents = await this.knex(this.table)
			.delete()
			.where(query || {})
			.returning(this.fieldNames(true))

		// Return the retrieved documents.
		return documents
	},
	async save(document) {
		// Update the entity with the given document key using the given document values.
		const documents = await this.update({
			key: document.key,
		}, dataType.object.shallowFilter(document, this.fieldNames()))

		// Return the first retrieved document.
		return documents[0]
	},
	async delete(document) {
		// Destroy the row with the given document key.
		const documents = await this.destroy({
			key: document.key,
		})

		// Return the first retrieved document.
		return documents[0]
	},
}
