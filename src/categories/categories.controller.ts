import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
// import { Roles } from '../auth/decorator';
import { JwtAuthGuard, RolesGuard } from '../auth/guard';
// import { Role } from '../auth/guard/roles';
import { SystemMessages } from '../common/constants/system-messages';
import { paramsIdDto } from '../common/dto/params-id.dto';
import { CategoryService } from './categories.service';
import { CategoryDto } from './dto/category.dto';

@Controller('events/categories')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  // @Roles(Role.Superadmin)
  @Post()
  async create(@Body() createCategoryDto: CategoryDto) {
    const category = await this.categoryService.create(createCategoryDto);
    return { message: SystemMessages.CATEGORY_CREATE_SUCCESS, category };
  }

  @Get()
  async findAll() {
    const categories = await this.categoryService.findAll();
    const message = categories.length
      ? SystemMessages.CATEGORY_RETRIEVE_SUCCESS
      : SystemMessages.CATEGORY_NOT_FOUND;
    return {
      message,
      categories,
    };
  }

  @Get(':categoryId')
  async findById(@Param() params: paramsIdDto) {
    const category = await this.categoryService.findById(params.id);
    return { message: SystemMessages.CATEGORY_RETRIEVE_SUCCESS, category };
  }

  @Patch(':categoryId')
  @ApiOperation({ summary: 'Update an category' })
  @ApiResponse({ status: 200, description: 'Category update successful' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  // @Roles(Role.Superadmin)
  async update(
    @Param() params: paramsIdDto,
    @Body() updateCategoryDto: CategoryDto,
  ) {
    const category = await this.categoryService.update(
      params.id,
      updateCategoryDto,
    );
    return { message: SystemMessages.CATEGORY_UPDATE_SUCCESS, category };
  }

  @Delete(':categoryId')
  @ApiOperation({ summary: 'Delete an category' })
  @ApiResponse({ status: 204, description: 'Delete category' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @HttpCode(204)
  // @Roles(Role.Superadmin)
  remove(@Param() params: paramsIdDto) {
    return this.categoryService.delete(params.id);
  }
}
