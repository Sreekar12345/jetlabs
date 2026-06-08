export const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateCode(length = 6) {
  return Array.from({ length })
    .map(() => CHARS[Math.floor(Math.random() * CHARS.length)])
    .join("");
}

export async function generateUniqueTeamCode(prismaClient: any) {
  let code;
  let exists;

  do {
    code = generateCode();
    exists = await prismaClient.team.findUnique({
      where: {
        teamCode: code,
      },
    });
  } while (exists);

  return code;
}
