export function resolveAvatarUrl(user: {
  avatarUrl: string | null
  githubUsername: string | null
}): string | null {
  return (
    user.avatarUrl ||
    (user.githubUsername ? `https://avatars.githubusercontent.com/${user.githubUsername}` : null)
  )
}
