export const userFields = ["id", "login", "fullName", "avatarUrl", "email"] as const

export const issueFieldsSchema = [
  "idReadable",
  "summary",
  { project: ["id"], customFields: ["id", "name", { value: ["name"] }] },
] as const
