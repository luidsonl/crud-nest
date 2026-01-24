import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
  ApiForbiddenResponse,
  ApiParam,
  ApiQuery,
  ApiCreatedResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { BookmarkService } from './bookmark.service';
import { JwtGuard } from 'src/auth/guard';
import { GetUser } from 'src/auth/decorator';
import {
  BookmarkQueryDto,
  UpdateBookmarkDto,
  CreateBookmarkDto,
  BookmarkResponseDto,
  BookmarkListResponseDto,
} from './dto';

@ApiTags('Bookmarks')
@ApiBearerAuth()
@ApiUnauthorizedResponse({
  description: 'Invalid, expired, or missing token',
  schema: {
    example: {
      statusCode: 401,
      message: 'Unauthorized',
    },
  },
})
@Controller('bookmark')
export class BookmarkController {
  constructor(private readonly bookmarkService: BookmarkService) {}

  @ApiOperation({
    summary: 'Create a new bookmark',
    description: 'Creates a new bookmark for the authenticated user.',
  })
  @ApiCreatedResponse({
    description: 'Bookmark created successfully',
    type: BookmarkResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
    schema: {
      example: {
        statusCode: 400,
        message: ['title should not be empty'],
        error: 'Bad Request',
      },
    },
  })
  @UseGuards(JwtGuard)
  @Post()
  create(
    @GetUser('id') userId: string,
    @Body() createBookmarkDto: CreateBookmarkDto,
  ): Promise<BookmarkResponseDto> {
    return this.bookmarkService.create(userId, createBookmarkDto);
  }

  @ApiOperation({
    summary: 'Get all bookmarks with filters',
    description: 'Retrieves a paginated list of bookmarks for the authenticated user with optional search filters.',
  })
  @ApiOkResponse({
    description: 'Bookmarks retrieved successfully',
    type: BookmarkListResponseDto,
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search term to filter by title or description',
    type: String,
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number for pagination (default: 1)',
    type: Number,
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of items per page (default: 10, max: 100)',
    type: Number,
    example: 10,
  })
  @UseGuards(JwtGuard)
  @Get()
  findAll(
    @GetUser('id') userId: string,
    @Query() query: BookmarkQueryDto,
  ): Promise<BookmarkListResponseDto> {
    return this.bookmarkService.findAllWithFilters(userId, query);
  }

  @ApiOperation({
    summary: 'Get a bookmark by ID',
    description: 'Retrieves a specific bookmark by its ID. User must own the bookmark.',
  })
  @ApiOkResponse({
    description: 'Bookmark retrieved successfully',
    type: BookmarkResponseDto,
  })
  @ApiParam({
    name: 'id',
    description: 'Bookmark UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiNotFoundResponse({
    description: 'Bookmark not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Bookmark not found',
        error: 'Not Found',
      },
    },
  })
  @ApiForbiddenResponse({
    description: 'User does not have permission to access this bookmark',
    schema: {
      example: {
        statusCode: 403,
        message: 'Access denied to this bookmark',
        error: 'Forbidden',
      },
    },
  })
  @UseGuards(JwtGuard)
  @Get(':id')
  findOne(
    @GetUser('id') userId: string,
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<BookmarkResponseDto> {
    return this.bookmarkService.findOne(userId, id);
  }

  @ApiOperation({
    summary: 'Update a bookmark',
    description: 'Updates a specific bookmark. User must own the bookmark.',
  })
  @ApiOkResponse({
    description: 'Bookmark updated successfully',
    type: BookmarkResponseDto,
  })
  @ApiParam({
    name: 'id',
    description: 'Bookmark UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiNotFoundResponse({
    description: 'Bookmark not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Bookmark not found',
        error: 'Not Found',
      },
    },
  })
  @ApiForbiddenResponse({
    description: 'User does not have permission to update this bookmark',
    schema: {
      example: {
        statusCode: 403,
        message: 'Access denied to this bookmark',
        error: 'Forbidden',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid update data',
    schema: {
      example: {
        statusCode: 400,
        message: ['link must be a URL address'],
        error: 'Bad Request',
      },
    },
  })
  @UseGuards(JwtGuard)
  @Patch(':id')
  update(
    @GetUser('id') userId: string,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateBookmarkDto: UpdateBookmarkDto,
  ): Promise<BookmarkResponseDto> {
    return this.bookmarkService.update(userId, id, updateBookmarkDto);
  }

  @ApiOperation({
    summary: 'Delete a bookmark',
    description: 'Deletes a specific bookmark. User must own the bookmark.',
  })
  @ApiOkResponse({
    description: 'Bookmark deleted successfully',
    schema: {
      example: {
        message: 'Bookmark deleted successfully',
      },
    },
  })
  @ApiParam({
    name: 'id',
    description: 'Bookmark UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiNotFoundResponse({
    description: 'Bookmark not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Bookmark not found',
        error: 'Not Found',
      },
    },
  })
  @ApiForbiddenResponse({
    description: 'User does not have permission to delete this bookmark',
    schema: {
      example: {
        statusCode: 403,
        message: 'Access denied to this bookmark',
        error: 'Forbidden',
      },
    },
  })
  @UseGuards(JwtGuard)
  @Delete(':id')
  remove(
    @GetUser('id') userId: string,
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<{ message: string }> {
    return this.bookmarkService.remove(userId, id);
  }
}