import prisma from '../utils/prismaClient.js';
import { assert } from 'superstruct';
import { CreateProductComment, PatchProductComment } from "../structs.js";

export const getCommentsByProductId = async (req, res) => {
  const { productId } = req.params;

  // cursor 방식의 페이지네이션
  const { cursor, take = 10, orderBy = 'recent' } = req.query;

  let orderConfig;
  switch (orderBy) {
    case 'oldest' :
      orderConfig = { createdAt : 'asc' };
      break;
    case 'recent' :
    default : 
      orderConfig = { createdAt : 'desc' };
  }
  const queryOptions = {
    where: { productId }, 
    take: parseInt(take),
    orderBy: orderConfig,
    ...(cursor && {
      cursor: { id: cursor },
      skip: 1
    })
  }

  const productComments = await prisma.productComment.findMany(queryOptions);

  res.send(productComments);
}

export const createProductComment = async (req, res) => {
  assert(req.body, CreateProductComment);

  const { productId } = req.params;
  const { content } = req.body;

  if(!content) {
    return res.status(400).send({ message: 'Content is required' });
  }

  const productComment = await prisma.productComment.create({
    data: {
      content,
      productId,
    },
  });

  res.status(201).send(productComment);
}

export const updateProductComment = async (req, res) => {
  assert(req.body, PatchProductComment);

  const { commentId } = req.params;
  const { content } = req.body;

  const updatedProductComment = await prisma.productComment.update({
    where: { id: commentId },
    data: { content },
  });

  res.send(updatedProductComment);
}

export const deleteProductComment = async (req, res) => {
  const { commentId } = req.params;

  await prisma.productComment.delete({
    where: { id: commentId },
  });

  res.sendStatus(204);
}