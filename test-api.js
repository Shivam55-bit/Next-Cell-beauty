#!/usr/bin/env node

/**
 * API Integration Test Script
 * Tests all production API endpoints
 */

import axios from 'axios';

const API_BASE_URL = 'https://api.deliveryplus.tech/naflin-api';
const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

async function testHealthCheck() {
  console.log('🔍 Testing Health Check...');
  try {
    const { data } = await axios.get(`${API_BASE_URL}/health`);
    console.log('✅ Health Check:', data);
    return true;
  } catch (error) {
    console.error('❌ Health Check failed:', error.message);
    return false;
  }
}

async function testGetProducts() {
  console.log('\n🔍 Testing Get Products...');
  try {
    const { data } = await client.get('/api/products');
    console.log('✅ Products API Response Structure:');
    console.log('   - success:', data.success);
    console.log('   - data type:', typeof data.data);
    console.log('   - products count:', data.data.length);
    
    if (data.data.length > 0) {
      console.log('\n📦 First Product:');
      const product = data.data[0];
      console.log('   - ID:', product.id);
      console.log('   - Name:', product.name);
      console.log('   - Category:', product.category);
      console.log('   - Price:', product.price);
      console.log('   - Stock:', product.stock);
      console.log('   - Image:', product.image);
      console.log('   - Gallery:', product.gallery.length, 'images');
    }
    return true;
  } catch (error) {
    console.error('❌ Get Products failed:', error.message);
    return false;
  }
}

async function testGetCategories() {
  console.log('\n🔍 Testing Get Categories...');
  try {
    const { data } = await client.get('/api/categories');
    console.log('✅ Categories API Response:');
    console.log('   - success:', data.success);
    console.log('   - categories:', data.data);
    return true;
  } catch (error) {
    console.error('❌ Get Categories failed:', error.message);
    return false;
  }
}

async function testGetProductBySlug() {
  console.log('\n🔍 Testing Get Product by Slug...');
  try {
    // First get all products to find a valid slug
    const { data: productsResponse } = await client.get('/api/products');
    const products = productsResponse.data;
    
    if (products.length === 0) {
      console.log('⚠️  No products available to test');
      return true;
    }
    
    const testSlug = products[0].slug;
    console.log('   Testing with slug:', testSlug);
    
    const { data } = await client.get(`/api/products/${testSlug}`);
    console.log('✅ Product by Slug API Response:');
    console.log('   - success:', data.success);
    console.log('   - product name:', data.data?.name || 'N/A');
    return true;
  } catch (error) {
    console.error('❌ Get Product by Slug failed:', error.message);
    return false;
  }
}

async function testImageURLs() {
  console.log('\n🔍 Testing Image URL Handling...');
  try {
    const { data } = await client.get('/api/products');
    const products = data.data;
    
    console.log('✅ Image URL Analysis:');
    let relativeCount = 0;
    let absoluteCount = 0;
    
    products.forEach(product => {
      if (product.image && product.image.startsWith('/uploads/')) {
        relativeCount++;
        console.log(`   📸 Relative URL: ${product.image}`);
        console.log(`      → Fixed: ${API_BASE_URL}${product.image}`);
      } else if (product.image) {
        absoluteCount++;
      }
    });
    
    console.log(`\n   Summary: ${relativeCount} relative URLs, ${absoluteCount} absolute URLs`);
    return true;
  } catch (error) {
    console.error('❌ Image URL test failed:', error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 Starting API Integration Tests');
  console.log('📡 Base URL:', API_BASE_URL);
  console.log('='.repeat(60));
  
  const results = {
    health: await testHealthCheck(),
    products: await testGetProducts(),
    categories: await testGetCategories(),
    productBySlug: await testGetProductBySlug(),
    imageURLs: await testImageURLs(),
  };
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 Test Results Summary:');
  console.log('='.repeat(60));
  
  Object.entries(results).forEach(([test, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${test}`);
  });
  
  const totalTests = Object.keys(results).length;
  const passedTests = Object.values(results).filter(Boolean).length;
  
  console.log('\n' + '='.repeat(60));
  console.log(`Final Score: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed! API integration is working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Please check the errors above.');
  }
}

runAllTests().catch(console.error);
