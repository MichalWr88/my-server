import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from "typeorm";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn()
  id: number | undefined;
  @Column()
  password!: string;

  @Column()
  name!: string;

  @Column()
  email!: string;
  @Column("enum", { enum: ["local", "prod"] })


  @CreateDateColumn()
  createdAt!: string;
}
