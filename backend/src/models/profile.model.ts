import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export interface IExperience {
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  description: string;
  current: boolean;
}

export interface ISocial {
  github?: string;
  linkedin?: string;
  twitter?: string;
  website?: string;
  email?: string;
}

@Entity('profiles')
export class Profile {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 100 })
  name!: string;

  @Column({ length: 200 })
  title!: string;

  @Column({ type: 'text' })
  bio!: string;

  @Column()
  avatar!: string;

  @Column({ type: 'json', nullable: true })
  skills!: string[];

  @Column({ type: 'json', nullable: true })
  experience!: IExperience[];

  @Column({ type: 'json', nullable: true })
  social?: ISocial;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  get _id(): string {
    return this.id;
  }
}
