import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';

export class RestClient {
  constructor(private readonly app: INestApplication) {}

  private logRequest(method: string, url: string, headers?: any, body?: any) {
    console.log('\n=== Request ===');
    console.log(`${method} ${url}`);
    if (headers) {
      console.log('Headers:', JSON.stringify(headers, null, 2));
    }
    if (body) {
      console.log('Body:', JSON.stringify(body, null, 2));
    }
  }

  private logResponse(response: request.Response) {
    console.log('\n=== Response ===');
    console.log(`Status: ${response.status}`);
    console.log('Headers:', JSON.stringify(response.headers, null, 2));
    if (response.body) {
      console.log('Body:', JSON.stringify(response.body, null, 2));
    }
    console.log('==================\n');
  }

  async get(url: string, headers?: Record<string, string>) {
    this.logRequest('GET', url, headers);
    const req = request(this.app.getHttpServer()).get(url);
    
    if (headers) {
      Object.entries(headers).forEach(([key, value]) => {
        req.set(key, value);
      });
    }

    const response = await req;
    this.logResponse(response);
    return response.body;
  }

  async post(url: string, body?: any, headers?: Record<string, string>) {
    this.logRequest('POST', url, headers, body);
    const req = request(this.app.getHttpServer()).post(url);
    
    if (headers) {
      Object.entries(headers).forEach(([key, value]) => {
        req.set(key, value);
      });
    }

    const response = await req.send(body);
    this.logResponse(response);
    return response.body;
  }

  async put(url: string, body?: any, headers?: Record<string, string>) {
    this.logRequest('PUT', url, headers, body);
    const req = request(this.app.getHttpServer()).put(url);
    
    if (headers) {
      Object.entries(headers).forEach(([key, value]) => {
        req.set(key, value);
      });
    }

    const response = await req.send(body);
    this.logResponse(response);
    return response.body;
  }

  async delete(url: string, headers?: Record<string, string>) {
    this.logRequest('DELETE', url, headers);
    const req = request(this.app.getHttpServer()).delete(url);
    
    if (headers) {
      Object.entries(headers).forEach(([key, value]) => {
        req.set(key, value);
      });
    }

    const response = await req;
    this.logResponse(response);
    return response.body;
  }
}