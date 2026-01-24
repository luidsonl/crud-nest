import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { BookmarkService } from './bookmark.service';
import { JwtGuard } from 'src/auth/guard';
import { GetUser } from 'src/auth/decorator';
import { BookmarkQueryDto, UpdateBookmarkDto,CreateBookmarkDto } from './dto';

@Controller('bookmark')
export class BookmarkController {
  constructor(private readonly bookmarkService: BookmarkService) {}

  @UseGuards(JwtGuard)
  @Post()
  create(@GetUser('id') userId: string, @Body() createBookmarkDto: CreateBookmarkDto) {
    return this.bookmarkService.create(userId ,createBookmarkDto);
  }

  @UseGuards(JwtGuard)
  @Get()
  findAll(@GetUser('id') userId: string, @Query() query: BookmarkQueryDto) {
    return this.bookmarkService.findAllWithFilters(userId, query);
  }

  @UseGuards(JwtGuard)
  @Get(':id')
  findOne(@GetUser('id') userId: string, @Param('id') id: string) {
    return this.bookmarkService.findOne(userId ,id);
  }

  @UseGuards(JwtGuard)
  @Patch(':id')
  update(@GetUser('id') userId: string, @Param('id') id: string, @Body() updateBookmarkDto: UpdateBookmarkDto) {
    return this.bookmarkService.update(userId ,id, updateBookmarkDto);
  }

  @UseGuards(JwtGuard)
  @Delete(':id')
  remove(@GetUser('id') userId: string, @Param('id') id: string) {
    return this.bookmarkService.remove(userId ,id);
  }
}
