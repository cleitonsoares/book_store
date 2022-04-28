import { BodyParams, PathParams, QueryParams, UseBefore } from "@tsed/common";
import { Controller } from "@tsed/di";
import { BadRequest, NotFound } from "@tsed/exceptions";
import { Delete, Get, Post, Put } from "@tsed/schema";
import { AccessTokenMiddleware } from "../middlewares/AccessTokenMiddleware";
import { BookRepository } from '../../database/repositores/BookRepository';
import { BookEntity } from '../../database/entities/BookEntity';
import { AuthorRepository } from "../../database/repositores/AuthorRepository";
import { PublisherRepository } from "../../database/repositores/PublisherRepository";
import momentTz from "moment-timezone";
import { BookAuthorRepository } from "../../database/repositores/BookAuthorRepository";
import { AuthorEntity } from "../../database/entities/AuthorEntity";
import { BookDTO, InventoryRequestDTO } from "../../dtos/BookDTO";
import { PublisherEntity } from "../../database/entities/PublisherEntity";
import { BookAuthorEntity } from "../../database/entities/BookAuthorEntity";
import { BookInventoryRepository } from "../../database/repositores/BookInventoryRepository";
import { BookInventoryEntity } from "../../database/entities/BookInventoryEntity";
import { InventoryTypeEnum } from "../enums/InventoryTypeEnum";

@Controller("/books")
@UseBefore(AccessTokenMiddleware)
export class UserController {
  constructor(
    private bookRepository: BookRepository,
    private authorRepository: AuthorRepository,
    private publisherRepository: PublisherRepository,
    private bookAuthorRepository: BookAuthorRepository,
    private bookInventoryRepository: BookInventoryRepository
  ) { }

  /**
   * List all books or search books by author, publisher or book name
   * @param searchTerm 
   * @returns found books
   */
  @Get("/")
  async list(@QueryParams('q') searchTerm: string): Promise<any[]> {

    let books: BookEntity[] = [];

    // If there is a search term, then, search books, else, list all
    if (!searchTerm) {
      books = await this.bookRepository.findAll()
        .catch((error) => {
          throw new BadRequest(`An error occured: ${error.toString()}`);
        });
    } else {
      books = await this.bookRepository.search(searchTerm)
        .catch((error) => {
          throw new BadRequest(`An error occured: ${error.toString()}`);
        });
    }

    if (!books.length) {
      throw new NotFound(`No books were found!`);
    }

    return books;
  }

  /**
   * Insert a new book, if authors or publisher was not found, create them and associate to book
   * @param body 
   * @returns inserted book
   */
  @Post("/")
  async save(@BodyParams() body: BookDTO) {

    try {

      let bookAuthors: AuthorEntity[] = [];

      // find or persist book authors
      for (const authorName of body.authors) {

        let author = await this.authorRepository.checkByName(authorName.name.trim());
        const existBookAuthor = await this.bookRepository.checkByNameAuthor(body.name, author);
        console.log('existBookAuthorexistBookAuthor', existBookAuthor)
        if (existBookAuthor.length) {
          throw new BadRequest(`A book with name ${body.name} and author ${author.name} alredy exists!`);
        }
        bookAuthors.push(author);
      }

      // find or persist publisher
      let publisher: PublisherEntity = await this.publisherRepository.checkByName(body.publisher.name);

      let newBook: BookEntity = this.bookRepository.create({
        name: body.name,
        published_at: momentTz(body.published_at).tz("America/Sao_Paulo"),
        publisher
      });

      // update or create book
      newBook = await this.bookRepository.save(newBook);

      // create book autors relations
      for (const bookAuthor of bookAuthors) {
        await this.bookAuthorRepository.save(this.bookAuthorRepository.create({
          book: newBook,
          author: bookAuthor
        }))
      }

      return {
        message: "Book was sucessful saved.",
        book: {
          ...newBook,
          authors: bookAuthors
        }
      }

    } catch (error) {
      throw new BadRequest(`An error occured: ${error.toString()}`);
    }
  }

  /**
   * Update book based on request's payload, if authors or publisher was not found, create them and associate to book
   * @param body 
   * @param id 
   * @returns updated book
   */
  @Put("/:id")
  async update(@BodyParams() body: BookDTO, @PathParams("id") id: number) {

    let book: BookEntity = await this.bookRepository.findOne(body.id);
    if (!book) {
      throw new NotFound("Book was not found!");
    }

    // Make update on filds
    let toUpdate: BookEntity = this.bookRepository.create({
      ...body,
      published_at: momentTz(body.published_at).tz("America/Sao_Paulo"),
    });

    // Set publisher if is present in the payload
    if (body.publisher && body.publisher.name) {
      toUpdate.publisher = await this.publisherRepository.checkByName(body.publisher.name);
    }

    // update book
    book = await this.bookRepository.save({
      ...toUpdate,
      id
    });

    let bookAuthors: BookAuthorEntity[] = [];
    // remove current authors and presist new ones
    if (body.authors && body.authors.length) {

      let authors: AuthorEntity[] = [];

      // find or persist book authors
      for (const authorName of body.authors) {

        let author = await this.authorRepository.checkByName(authorName.name.trim());
        authors.push(author);
      }

      // Remove authors relations to keep updated accordin request payload
      await this.bookAuthorRepository.delete({
        book
      });

      // create book autors relations
      for (const author of authors) {
        const bookAuthor = await this.bookAuthorRepository.save(this.bookAuthorRepository.create({
          book,
          author
        }));

        bookAuthors.push(bookAuthor);
      }
    } else {

      bookAuthors = await this.bookAuthorRepository.find({
        where: {
          book
        },
        relations: ['author']
      })
    }

    return {
      message: "Book was sucessful saved.",
      book: {
        ...book,
        bookAuthors
      }
    }
  }

  /**
   * Delete a book if it's balance isn't positive
   * @param id 
   * @returns message
   */
  @Delete("/:id")
  async delete(@PathParams("id") id: number) {
    const book: BookEntity = await this.bookRepository.findOne(id);

    if (!book) {
      throw new NotFound(`No books were found!`);
    }

    // Get current balance of book 
    const getCurrentInventory = await this.bookInventoryRepository.getBookCurrentInventory(book);
    const currentInventory = parseInt(getCurrentInventory[0].current_inventory || 0);

    if (currentInventory > 0) {
      throw new BadRequest("The book can't be removed, because it have a positive balance!");
    } else {

      await this.bookRepository.delete(id);
    }

    return {
      message: "Book was sucessful removed.",
    }
  }

  /**
   * Manage the book inventory, if quantity in request payload is positive, add a row with IN 
   * type to inventory registry, if negative, the type will be OUT, and returns 
   * the balance of this operations.
   * @param body 
   * @param id 
   * @returns current balance of the book
   */
  @Post("/:id/inventory")
  async inventory(@BodyParams() body: InventoryRequestDTO, @PathParams("id") id: number) {

    const book: BookEntity = await this.bookRepository.findOne(id);
    let inventory: BookInventoryEntity;

    if (!book) {
      throw new NotFound(`No books were found!`);
    }

    // Get current balance of book 
    const getCurrentInventory = await this.bookInventoryRepository.getBookCurrentInventory(book);
    const currentInventory = parseInt(getCurrentInventory[0].current_inventory || 0);

    // calculate new book balance
    const aftertInventory = currentInventory + body.quantity;

    // if its stay positive, save the movment, else throw negative balance eror
    if (aftertInventory >= 0) {
      inventory = await this.bookInventoryRepository.save(this.bookInventoryRepository.create({
        book,
        quantity: body.quantity < 0 ? body.quantity * -1 : body.quantity,
        in_out: body.quantity > 0 ? InventoryTypeEnum.IN : InventoryTypeEnum.OUT
      }));
    } else {
      throw new BadRequest("The balance of the book can't go negative!");
    }

    return {
      message: "Book inventory was saved with sucessful.",
      inventory: {
        book,
        current_inventory: aftertInventory
      }
    }
  }

  /**
   * Find current balance of the book
   * @param id 
   * @returns current balance of one book
   */
  @Get("/:id/inventory")
  async getInventory(@PathParams("id") id: number) {

    const book: BookEntity = await this.bookRepository.findOne(id);

    if (!book) {
      throw new NotFound(`No books were found!`);
    }

    // Get current balance of book 
    const getCurrentInventory = await this.bookInventoryRepository.getBookCurrentInventory(book);
    const currentInventory = parseInt(getCurrentInventory[0].current_inventory || 0);

    return {
      book,
      current_inventory: currentInventory
    }
  }
}