-- AddLocationDescription
-- 为 Restaurant 表添加 locationDescription 字段

-- 添加新字段
ALTER TABLE "Restaurant" ADD COLUMN "locationDescription" TEXT NOT NULL DEFAULT '';

-- 创建餐厅类型枚举
CREATE TYPE "RestaurantType" AS ENUM ('CAMPUS_DINING', 'OFF_CAMPUS_MEAL', 'OFF_CAMPUS_SNACK', 'OFF_CAMPUS_DRINK');

-- 更新现有餐厅类型为新的枚举值
-- 这里需要映射现有的字符串类型到新的枚举值
UPDATE "Restaurant"
SET "type" = CASE
    WHEN "type" IN ('中餐', '西餐', '日料', '韩料', '快餐', '火锅', '烧烤', '校内餐饮') THEN 'CAMPUS_DINING'
    WHEN "type" IN ('甜品', '咖啡', '校外茶饮') THEN 'OFF_CAMPUS_DRINK'
    WHEN "type" = '校外主食' THEN 'OFF_CAMPUS_MEAL'
    WHEN "type" = '校外小食' THEN 'OFF_CAMPUS_SNACK'
    ELSE 'CAMPUS_DINING' -- 默认值
END;

-- 修改 type 字段类型为枚举
ALTER TABLE "Restaurant" ALTER COLUMN "type" TYPE "RestaurantType" USING "type"::"RestaurantType";