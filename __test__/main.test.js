const reviewRouter = require('../routes/review');
const revieRouter = require('../schemas/review');
const httpMocks = require('node-mocks-http');
const newProduct = require('../data/new-product.json');

productModel.create = jest.fn(); // 직접적으로 모델에 영향을 주지않기 위해서 목 함수 사용

let req, res, next; // 전역변수로 선언 해쥬기 위해서
beforeEach(() => {
    req = httpMocks.createRequest();
    res = httpMocks.createResponse();
    next = jest.fn();
});

describe('action basic test', () => {
    beforeEach(() => {
        req.body = newProduct;
    });
    // productController 에 createProduct는 function이다. 폴더지정 잘 해주기
    test('1+1', () => {
        expect(1 + 1).toEqual(2);
    });

    //  productController.createProduct(); 호출이 될때, productModel.create() 가 호출이 되는지.
    //   test('should call ProductModel.create', async () => {
    //     await productController.createProduct(req, res, next);
    //     expect(productModel.create).toBeCalledWith(newProduct);
    //   });

    //   //productController.createProduct(req, res, next) 실행되었을때,  status가 201이 나오는지, 보내주는 샌드값이 있는지
    //   test('should return 201 response code', async () => {
    //     await productController.createProduct(req, res, next);
    //     expect(res.statusCode).toBe(201);
    //     expect(res._isEndCalled()).toBeTruthy();
    //   });

    //   //
    //   test('should return json body in response', async () => {
    //     productModel.create.mockReturnValue(newProduct);
    //     await productController.createProduct(req, res, next);
    //     expect(res._getJSONData()).toStrictEqual(newProduct);
    //   });

    //   //
    //   test('should handle errors', async () => {
    //     const errorMessage = { message: 'description property missing' }; // 임의로 만들어준 에러값 몽고디비이 관여하지 않기 위해서
    //     const rejectPromise = Promise.reject(errorMessage); // receject 는 실패한 이유를 값으로 넣어줘야함
    //     productModel.create.mockReturnValue(rejectPromise);
    //     await productController.createProduct(req, res, next);
    //     expect(next).toBeCalledWith(errorMessage);
    //   });
});
