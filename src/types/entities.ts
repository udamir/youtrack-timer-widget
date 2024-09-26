import type { Entity, Issue, User, WorkItemType } from "youtrack-client"
import type { issueFieldsSchema, userFields } from "../consts"

export type UserEntity = Entity<User, typeof userFields>
export type WorkItemTypeEntity = Entity<WorkItemType, ["id", "name"]>
export type IssueEntity = Entity<Issue, typeof issueFieldsSchema>
