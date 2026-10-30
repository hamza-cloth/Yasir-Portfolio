NestJS is a Node.js framework for building backends with a clear structure. It borrows ideas from Angular and Spring: **modules** group features, **controllers** handle HTTP, **services** hold the business logic, and dependency injection wires them together.

## The building blocks

```ts
@Controller("tickets")
export class TicketsController {
  constructor(private readonly tickets: TicketsService) {}

  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.tickets.findOne(id);
  }

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles("staff")
  create(@Body() dto: CreateTicketDto) {
    return this.tickets.create(dto);
  }
}
```

```ts
@Injectable()
export class TicketsService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(id: number) {
    const ticket = await this.prisma.ticket.findUnique({ where: { id } });
    if (!ticket) throw new NotFoundException();
    return ticket;
  }
}
```

The controller stays thin: it reads the request and calls the service. The service knows nothing about HTTP, which makes it easy to test.

## The request pipeline

Every request passes through the same stages, in order:

1. **Middleware:** logging, CORS, request IDs.
2. **Guards:** may this request continue? Authentication and roles live here.
3. **Interceptors (before):** timing, caching, transforming.
4. **Pipes:** validate and convert input, for example the DTO and `ParseIntPipe`.
5. **Controller and service:** your code.
6. **Interceptors (after)** and **exception filters:** shape the response or the error.

If a guard or pipe rejects the request, your business logic never runs.

## Validating input with DTOs

```ts
export class CreateTicketDto {
  @IsString()
  @Length(3, 120)
  title: string;

  @IsIn(["low", "normal", "high"])
  priority: string;
}
```

```ts
app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
```

`whitelist` strips unknown fields, so a client cannot set fields you did not declare.

## Modules

```ts
@Module({
  imports: [PrismaModule],
  controllers: [TicketsController],
  providers: [TicketsService],
})
export class TicketsModule {}
```

One module per feature keeps a large codebase navigable: tickets, users, billing.

## When it goes wrong

- **"Nest can't resolve dependencies of TicketsService":** the provider it needs is not in this module or not exported from the module that owns it.
- **Validation never runs:** the global `ValidationPipe` is missing, or the DTO is an interface instead of a class.
- **A guard seems ignored:** it is applied to the wrong controller or method, or the route is marked public.
