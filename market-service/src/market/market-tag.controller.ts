import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { MarketService } from './market.service';
import { CreateMarketTagDto, UpdateMarketTagDto, AssignMarketTagsDto } from './dto/market.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('market-tags')
@UseGuards(JwtAuthGuard)
export class MarketTagController {
  constructor(
    private readonly marketService: MarketService,
  ) {}

  @Post()
  createTag(@Body() dto: CreateMarketTagDto) {
    return this.marketService.createTag(dto);
  }

  @Get()
  getTags() {
    return this.marketService.getTags();
  }

  @Post(':marketId/assign-tags')
  assignTagsToMarket(@Param('marketId') marketId: string, @Body() dto: AssignMarketTagsDto) {
    return this.marketService.assignTagsToMarket(marketId, dto.tagIds);
  }

  @Put(':id')
  updateTag(@Param('id') id: string, @Body() dto: UpdateMarketTagDto) {
    return this.marketService.updateTag(id, dto);
  }

  @Delete(':id')
  async deleteTag(@Param('id') id: string) {
    return this.marketService.deleteTag(id);
  }
}