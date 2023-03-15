import { applyDecorators } from "@nestjs/common";
import { ApiOkResponse, getSchemaPath } from "@nestjs/swagger";

export function ApiPagedResponse(itemType: any) {
  return applyDecorators(
    ApiOkResponse({
      schema: {
        allOf: [
          {
            properties: {
              items: {
                type: 'array',
                items: { $ref: getSchemaPath(itemType) },
              },
              paging: {
                type: 'object',
                properties: {
                  limit: {
                    type: 'number'
                  },
                  offset: {
                    type: 'number'
                  },
                  totalCount: {
                    type: 'number'
                  }
                }
              }
            },
          },
        ],
      }
    })
  )
}
