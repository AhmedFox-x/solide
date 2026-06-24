import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
const prisma = new PrismaClient();

async function main() {
  const projects = await prisma.project.findMany();
  const testimonials = await prisma.testimonial.findMany();
  const tickets = await prisma.ticket.findMany();
  const admins = await prisma.admin.findMany();
  const media = await prisma.media.findMany();
  
  const seed = {
    projects: projects.map(p => ({
      id: p.id, title: p.title, description: p.description,
      category: p.category, type: p.type, images: p.images,
      videos: p.videos, models3d: p.models3d,
      beforeImage: p.beforeImage, afterImage: p.afterImage,
      status: p.status, featured: p.featured, sortOrder: p.sortOrder,
      createdAt: p.createdAt.toISOString(), updatedAt: p.updatedAt.toISOString()
    })),
    testimonials: testimonials.map(t => ({
      id: t.id, name: t.name, title: t.title, content: t.content,
      rating: t.rating, imageUrl: t.imageUrl, company: t.company,
      featured: t.featured, createdAt: t.createdAt.toISOString(), updatedAt: t.updatedAt.toISOString()
    })),
    tickets: tickets.map(t => ({
      id: t.id, name: t.name, email: t.email, phone: t.phone,
      subject: t.subject, message: t.message, type: t.type,
      preferredContact: t.preferredContact, status: t.status,
      priority: t.priority, response: t.response,
      createdAt: t.createdAt.toISOString(), updatedAt: t.updatedAt.toISOString()
    })),
    admins: admins.map(a => ({
      id: a.id, email: a.email, passwordHash: a.passwordHash, name: a.name,
      createdAt: a.createdAt.toISOString(), updatedAt: a.updatedAt.toISOString()
    })),
    media: media.map(m => ({
      id: m.id, filename: m.filename, url: m.url, mimeType: m.mimeType,
      sizeBytes: m.sizeBytes, mediaType: m.mediaType, altText: m.altText,
      createdAt: m.createdAt.toISOString()
    }))
  };
  
  fs.writeFileSync('prisma/seed-data.json', JSON.stringify(seed, null, 2));
  console.log('Seed data written to prisma/seed-data.json');
  console.log('Projects:', projects.length);
  console.log('Testimonials:', testimonials.length);
  console.log('Tickets:', tickets.length);
  console.log('Admins:', admins.length);
  console.log('Media:', media.length);
}

main().catch(e => { console.error(e); process.exit(1); });