import { Request, Response, NextFunction } from 'express'
import { AuthRequest } from '../../middleware/auth'
import * as authService from './auth.service'
import { AuthCredentialsDto, RefreshTokenDto } from './dto/auth.dto'
import { validateDto } from '../../utils/validation'
import { InfoResponse, MessageResponse, TokenResponse } from '../../types/responses'

export async function signupController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response<TokenResponse> | void> {
  try {
    const dto = await validateDto(AuthCredentialsDto, req.body)
    const tokens = await authService.signup(dto.id, dto.password)
    const body: TokenResponse = {
      token: tokens.token,
      refresh_token: tokens.refreshToken,
    }
    return res.status(201).json(body)
  } catch (err) {
    return next(err)
  }
}

export async function signinController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response<TokenResponse> | void> {
  try {
    const dto = await validateDto(AuthCredentialsDto, req.body)
    const tokens = await authService.signin(dto.id, dto.password)
    const body: TokenResponse = {
      token: tokens.token,
      refresh_token: tokens.refreshToken,
    }
    return res.json(body)
  } catch (err) {
    return next(err)
  }
}

export async function refreshTokenController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response<TokenResponse> | void> {
  try {
    const dto = await validateDto(RefreshTokenDto, req.body)
    const tokens = await authService.refreshToken(dto.refresh_token)
    const body: TokenResponse = {
      token: tokens.token,
      refresh_token: tokens.refreshToken,
    }
    return res.json(body)
  } catch (err) {
    return next(err)
  }
}

export function infoController(req: AuthRequest, res: Response<InfoResponse>): Response<InfoResponse> {
  return res.json({ id: req.user?.id })
}

export async function logoutController(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<Response<MessageResponse> | void> {
  try {
    await authService.logout(req.user!.id, req.user?.tokenJti)
    const body: MessageResponse = { message: 'Logged out successfully' }
    return res.json(body)
  } catch (err) {
    return next(err)
  }
}
