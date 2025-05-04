#!/bin/bash
# test-connections.sh

echo "Testing MongoDB connection..."
curl -s http://localhost:3000/mongo-test | jq
echo ""

echo "Testing PostgreSQL connection..."
curl -s http://localhost:3000/postgres-test | jq
echo ""

echo "Testing Redis connection..."
curl -s http://localhost:3000/redis-test | jq
echo ""

echo "Testing all connections..."
curl -s http://localhost:3000/test-all | jq