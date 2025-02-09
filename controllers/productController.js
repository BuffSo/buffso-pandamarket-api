import prisma from '../utils/prismaClient.js';
import { assert } from 'superstruct';
import { CreatePoduct, PatchProduct } from '../structs.js';

export const getProcuts = async (req, res) => {
  const { page = 1, pageSize = 10, orderBy = 'recent', keyword = '', category ='' } = req.query;

  const offset = (page -1) * pageSize;
  const skip = offset;
  const take = parseInt(pageSize);

  let orderConfig;
  switch (orderBy) {
    case 'oldest' :
      orderConfig = { createdAt : 'asc' };
      break;
    case 'recent' :
    default : 
      orderConfig = { createdAt : 'desc' };
  }

  const where = {
    AND: [
      keyword ? {
        OR: [
          { name: { contains: keyword, mode: 'insensitive' } },   // 대소문자 구분 없이 검색
          { description: { contains: keyword, mode: 'insensitive' } } 
        ]
      } : {},
      category ? { category: category } : {}
    ]
  };
  // 상품 리스트
  const products = await prisma.product.findMany({
    where, 
    orderBy: orderConfig,
    skip,
    take,
    include: {
      productComments: true
    }
  });
  // 총 개수
  const totalCount = await prisma.product.count({ where });
  res.send({
    list: products,
    totalCount: totalCount
  });
};

export const getProductById = async (req, res) => {
  const { id } = req.params;
  const product = await prisma.product.findUnique({
    where : { id },
    include: {
      productComments: true, 
    }
  });
  if (!product) {
    return res.status(404).send({message: 'No product found with the given ID'});
  }
  res.send(product);
};

export const createProduct = async(req, res) => {
  assert(req.body, CreatePoduct);

  const product = await prisma.product.create({
    data: req.body,
  });
  res.status(201).send(product);
};

export const updateProduct =  async(req, res) => {
  assert(req.body, PatchProduct);
  
  const { id } = req.params;
  const product = await prisma.product.update({
    where : { id },
    data : req.body,
  });
  res.send(product);
};

export const deletProduct = async(req, res) => {
  const { id } = req.params;
  await prisma.product.delete({
    where : { id },
  });
  res.sendStatus(204);
};
