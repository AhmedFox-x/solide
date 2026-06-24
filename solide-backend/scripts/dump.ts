import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const projects = await prisma.project.findMany();
  console.log("PROJECTS:", projects.length);
  for (const p of projects) console.log(JSON.stringify(p));
  const testimonials = await prisma.testimonial.findMany();
  console.log("TESTIMONIALS:", testimonials.length);
  for (const t of testimonials) console.log(JSON.stringify(t));
  const tickets = await prisma.ticket.findMany();
  console.log("TICKETS:", tickets.length);
  const admins = await prisma.admin.findMany();
  console.log("ADMINS:", admins.length);
  for (const a of admins) console.log(JSON.stringify(a));
  const media = await prisma.media.findMany();
  console.log("MEDIA:", media.length);
  for (const m of media) console.log(JSON.stringify(m));
}
main().catch((e) => console.error(e.message));
