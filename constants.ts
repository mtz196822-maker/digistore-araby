import { NewsItem, Product } from './types';

export const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    title: 'باقة المصمم المحترف',
    description: 'مجموعة خطوط عربية وأيقونات فيكتور عالية الدقة.',
    price: 49.99,
    type: 'package',
    seller_id: 'merchant_1',
    image_url: 'https://picsum.photos/400/400?random=1'
  },
  {
    id: '2',
    title: 'كورس React المتقدم',
    description: 'دورة شاملة لتعلم React مع TypeScript.',
    price: 120.00,
    type: 'digital_product',
    seller_id: 'merchant_1',
    image_url: 'https://picsum.photos/400/400?random=2'
  },
  {
    id: '3',
    title: 'قالب موقع تجاري',
    description: 'قالب HTML/CSS جاهز ويدعم العربية بالكامل.',
    price: 25.50,
    type: 'digital_product',
    seller_id: 'merchant_2',
    image_url: 'https://picsum.photos/400/400?random=3'
  },
  {
    id: '4',
    title: 'باقة التسويق',
    description: 'خطط تسويقية جاهزة ومنشورات سوشيال ميديا.',
    price: 75.00,
    type: 'package',
    seller_id: 'merchant_2',
    image_url: 'https://picsum.photos/400/400?random=4'
  }
];

export const MOCK_NEWS: NewsItem[] = [
  {
    id: '1',
    title: 'خصم خاص ٥٠٪',
    content: 'احصل على خصم ٥٠٪ على جميع الباقات حتى نهاية الأسبوع.',
    created_at: new Date().toISOString(),
    type: 'offer'
  },
  {
    id: '2',
    title: 'تحديث جديد للمنصة',
    content: 'تم إضافة وسائل دفع جديدة لتسهيل عملية الشراء.',
    created_at: new Date().toISOString(),
    type: 'update'
  },
  {
    id: '3',
    title: 'تنبيه هام',
    content: 'سيتم إجراء صيانة دورية للموقع يوم الجمعة القادم.',
    created_at: new Date().toISOString(),
    type: 'alert'
  }
];