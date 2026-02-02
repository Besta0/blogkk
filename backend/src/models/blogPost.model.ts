import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';

@Entity('blog_posts')
export class BlogPost {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 200 })
  title!: string;

  @Column({ unique: true })
  slug!: string;

  @Column({ type: 'text' })
  content!: string;

  @Column({ length: 500 })
  excerpt!: string;

  @Column({ nullable: true })
  coverImage?: string;

  @Column({ type: 'json', nullable: true })
  tags!: string[];

  @Column({ default: false })
  published!: boolean;

  @Column({ type: 'datetime', nullable: true })
  publishedAt?: Date;

  @Column({ default: 0 })
  views!: number;

  @Column({ default: 1 })
  readTime!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  get _id(): string {
    return this.id;
  }

  @BeforeInsert()
  @BeforeUpdate()
  calculateReadTime() {
    if (this.content) {
      const wordsPerMinute = 200;
      const wordCount = this.content.split(/\s+/).length;
      this.readTime = Math.max(1, Math.ceil(wordCount / wordsPerMinute));
    }
  }
}
