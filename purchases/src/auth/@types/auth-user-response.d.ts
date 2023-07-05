declare interface AuthUserResponse {
  sub: string
  email_verified: boolean
  name: string
  preferred_username: string
  given_name: string
  family_name: string
  email: string
  group_permissions: string[]
  groups: string[]
}
