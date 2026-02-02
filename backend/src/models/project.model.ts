import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 200 })
  title!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'json', nullable: true })
  technologies!: string[];

  @Column({ type: 'json', nullable: true })
  images!: string[];

  @Column({ nullable: true })
  githubUrl?: string;

  @Column({ nullable: true })
  liveUrl?: string;

  @Column({ default: false })
  featured!: boolean;

  @Column({ default: 0 })
  likes!: number;

  @Column({ default: 0 })
  views!: number;

  @Column({ default: 0 })
  shares!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  get _id(): string {
    return this.id;
  }
}
