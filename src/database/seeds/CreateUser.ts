import { Connection } from 'typeorm';
import { Factory, Seeder } from 'typeorm-seeding';
import { UserEntity } from '../entities/UserEntity';
import crypto from "crypto-js";

export default class CreateUsers implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<void> {
    await connection.createQueryBuilder()
      .insert()
      .into(UserEntity)
      .values({
        name: 'Admin',
        email: 'a@a.com',
        password: crypto.SHA256("123").toString()
      })
      .execute();
  }
}
