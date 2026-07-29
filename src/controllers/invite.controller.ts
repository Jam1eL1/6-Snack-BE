import { RequestHandler } from "express";
import { TInviteIdParamsDto, TCreateInviteRequestDto } from "../dtos/invite.dto";
import { Role } from "../generated/prisma/client";
import inviteService from "../services/invite.service";


const createInvite: RequestHandler<{}, any, TCreateInviteRequestDto> = async (req, res, next) => {
  try {
    const result = await inviteService.createInvite(req.body, req.protocol, process.env.SIGNUP_HOST);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

const getInviteInfo: RequestHandler<TInviteIdParamsDto> = async (req, res, next) => {
  const inviteId = req.params.inviteId;
  try {
    const result = await inviteService.getInviteInfo(inviteId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export default { createInvite, getInviteInfo };
