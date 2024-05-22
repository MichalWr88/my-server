import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from "typeorm";

@Entity("token_history")
export class TokenHistory {
  @PrimaryGeneratedColumn()
  id: number | undefined;
  @Column()
  email!: string;
  @CreateDateColumn()
  createdAt!: string;
}
