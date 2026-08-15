// src/modules/dashboard/dashboard.controller.ts
import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiOkResponse } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/interfaces/user-roles.enum';
import { ResponseDto } from '../../common/dto/response.dto';
import { AdminDashboardResponseDto } from './dto/admin-dashboard.dto';
import { ParentDashboardResponseDto } from './dto/parent-dashboard.dto';

@ApiTags('dashboard')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('admin')
  @Roles(UserRole.ORTHOPHONISTE)
  @ApiOperation({ summary: 'Get admin dashboard data (Orthophoniste only)' })
  @ApiOkResponse({
    description: 'Admin dashboard data retrieved successfully',
    type: AdminDashboardResponseDto,
  })
  @ApiResponse({ status: 403, description: 'Forbidden - Only orthophonistes can access admin dashboard' })
  async getAdminDashboard(@Request() req) {
    const data = await this.dashboardService.getAdminDashboard(req.user.id);
    return new ResponseDto({
      statusCode: 200,
      message: 'Admin dashboard data retrieved successfully',
      data,
    });
  }

  @Get('parent')
  @Roles(UserRole.PARENT)
  @ApiOperation({ summary: 'Get parent dashboard data (Parent only)' })
  @ApiOkResponse({
    description: 'Parent dashboard data retrieved successfully',
    type: ParentDashboardResponseDto,
  })
  @ApiResponse({ status: 403, description: 'Forbidden - Only parents can access parent dashboard' })
  async getParentDashboard(@Request() req) {
    const data = await this.dashboardService.getParentDashboard(req.user.id);
    return new ResponseDto({
      statusCode: 200,
      message: 'Parent dashboard data retrieved successfully',
      data,
    });
  }
}