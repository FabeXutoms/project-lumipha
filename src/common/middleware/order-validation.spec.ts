import { OrderValidationMiddleware } from './order-validation.middleware';
import { BadRequestException } from '@nestjs/common';

describe('OrderValidationMiddleware', () => {
    let middleware: OrderValidationMiddleware;
    let mockRequest: any;
    let mockResponse: any;
    let nextFunction: jest.Mock;

    beforeEach(() => {
        middleware = new OrderValidationMiddleware();
        mockRequest = {
            body: {}
        };
        mockResponse = {};
        nextFunction = jest.fn();
    });

    it('should pass validation with valid data', () => {
        mockRequest.body = {
            name: 'John Doe',
            companyName: 'Acme Corp',
            businessType: 'Tech',
            businessScale: 'Large',
            phone: '1234567890',
            email: 'john@example.com'
        };

        middleware.use(mockRequest, mockResponse, nextFunction);
        expect(nextFunction).toHaveBeenCalled();
    });

    it('should strip non-numeric characters from phone', () => {
        mockRequest.body = {
            name: 'John Doe',
            companyName: 'Acme Corp',
            businessType: 'Tech',
            businessScale: 'Large',
            phone: '(123) 456-7890',
            email: 'john@example.com'
        };

        middleware.use(mockRequest, mockResponse, nextFunction);
        expect(mockRequest.body.phone).toBe('1234567890');
        expect(nextFunction).toHaveBeenCalled();
    });

    it('should fail if phone is too short', () => {
        mockRequest.body = {
            name: 'John Doe',
            companyName: 'Acme Corp',
            businessType: 'Tech',
            businessScale: 'Large',
            phone: '123',
            email: 'john@example.com'
        };

        expect(() => {
            middleware.use(mockRequest, mockResponse, nextFunction);
        }).toThrow(BadRequestException);
    });

    it('should fail if email is invalid', () => {
        mockRequest.body = {
            name: 'John Doe',
            companyName: 'Acme Corp',
            businessType: 'Tech',
            businessScale: 'Large',
            phone: '1234567890',
            email: 'invalid-email'
        };

        expect(() => {
            middleware.use(mockRequest, mockResponse, nextFunction);
        }).toThrow(BadRequestException);
    });

    it('should sanitize XSS inputs', () => {
        mockRequest.body = {
            name: '<script>alert("xss")</script>',
            companyName: 'Acme Corp',
            businessType: 'Tech',
            businessScale: 'Large',
            phone: '1234567890',
            email: 'john@example.com'
        };

        middleware.use(mockRequest, mockResponse, nextFunction);
        expect(mockRequest.body.name).toBe('&lt;script&gt;alert("xss")&lt;/script&gt;');
        expect(nextFunction).toHaveBeenCalled();
    });
});
