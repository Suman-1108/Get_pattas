const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const Brand = require('./models/Brand');
const Category = require('./models/Category');
const Product = require('./models/Product');
const Admin = require('./models/Admin');

const SEED_BRANDS = [
  {
    slug: 'getpattas ',
    name: 'Get pattas ',
    logoUrl: '/uploads/logo.jpg',
    themeColor: '#dc2626',
    contactPhone: ['+91 86104 51118', '+91 86104 51118'],
    contactEmail: 'contact@getpattas .com',
    address: '12/4B Sivakasi Main Road, Factory Zone, Sivakasi, Tamil Nadu - 626123'
  },
  {
    slug: 'muthu-cracker',
    name: 'Get pattas Cracker',
    logoUrl: '/uploads/logo.jpg',
    themeColor: '#059669',
    contactPhone: ['+91 86104 51118', '+91 86104 51118'],
    contactEmail: 'sales@getpattas.com',
    address: '258, Get pattas Crackers, Sivakasi, Tamil Nadu - 626123'
  },
  {
    slug: 'Get pattas -cracker',
    name: 'Get pattas  Cracker',
    logoUrl: '/uploads/logo.jpg',
    themeColor: '#7c3aed',
    contactPhone: ['+91 86104 51118', '+91 86104 51118'],
    contactEmail: 'orders@Get pattas cracker.com',
    address: 'Get pattas \'s Cracker Depot, Bypass Road, Sivakasi, Tamil Nadu - 626189'
  },
  {
    slug: 'velmurugan-cracker',
    name: 'Velmurugan Cracker',
    logoUrl: '/uploads/logo.jpg',
    themeColor: '#ea580c',
    contactPhone: ['+91 86104 51118', '+91 86104 51118'],
    contactEmail: 'support@velmurugancracker.com',
    address: 'Star Velmurugan Pyro Tech, Sivakasi, Tamil Nadu - 626124'
  }
];

const SEED_CATEGORIES = [
  { name: 'Sparklers (மத்தாப்பு)', slug: 'sparklers', displayOrder: 1 },
  { name: 'Ground Chakkars (தரை சக்கரம்)', slug: 'chakkars', displayOrder: 2 },
  { name: 'Flowerpots (பூச்சட்டி)', slug: 'flowerpots', displayOrder: 3 },
  { name: 'Sound Crackers & Bombs (வெடி & பாம்)', slug: 'sound-bombs', displayOrder: 4 },
  { name: 'Sky Shots & Aerial (வான வெடி)', slug: 'skyshots', displayOrder: 5 },
  { name: 'Kids Special & Fancy (பேன்ஸி வெடிகள்)', slug: 'fancy', displayOrder: 6 },
  { name: 'Gift Boxes & Combos (கிப்ட் பாக்ஸ் & காம்போ)', slug: 'giftboxes-combos', displayOrder: 7 }
];

// Curated authentic Sivakasi cracker catalog template
const SIVAKASI_CATALOG_TEMPLATE = [
  // Sparklers
  { code: 'SPK-001', name: '7 CM Electric Sparklers', tamilName: '7 செ.மீ எலட்ரிக் மத்தாப்பு', catSlug: 'sparklers', packInfo: '10 Pcs/Box', mrp: 35, sellingPrice: 7, img: '/uploads/product_sparklers.jpg' },
  { code: 'SPK-002', name: '10 CM Electric Sparklers', tamilName: '10 செ.மீ எலட்ரிக் மத்தாப்பு', catSlug: 'sparklers', packInfo: '10 Pcs/Box', mrp: 95, sellingPrice: 19, img: '/uploads/product_sparklers.jpg' },
  { code: 'SPK-003', name: '10 CM Green Sparklers', tamilName: '10 செ.மீ பச்சை மத்தாப்பு', catSlug: 'sparklers', packInfo: '10 Pcs/Box', mrp: 110, sellingPrice: 22, img: '/uploads/product_sparklers_color.jpg' },
  { code: 'SPK-004', name: '15 CM Crackling Sparklers', tamilName: '15 செ.மீ கிராக்களிங் மத்தாப்பு', catSlug: 'sparklers', packInfo: '5 Pcs/Box', mrp: 255, sellingPrice: 51, img: '/uploads/product_sparklers.jpg' },
  { code: 'SPK-005', name: '30 CM Giant Royal Sparklers', tamilName: '30 செ.மீ எலட்ரிக் மத்தாப்பு', catSlug: 'sparklers', packInfo: '5 Pcs/Box', mrp: 200, sellingPrice: 40, img: '/uploads/product_sparklers_giant.jpg' },
  { code: 'SPK-006', name: '50 CM Mega Sparklers', tamilName: '50 செ.மீ எலட்ரிக் மத்தாப்பு', catSlug: 'sparklers', packInfo: '10 Pcs/Box', mrp: 1000, sellingPrice: 200, img: '/uploads/product_sparklers_giant.jpg' },
  { code: 'SPK-007', name: 'Rotating Sparklers 5 in 1', tamilName: 'சுழலும் மத்தாப்பு', catSlug: 'sparklers', packInfo: '10 Pcs/Box', mrp: 1200, sellingPrice: 240, img: '/uploads/product_sparklers_giant.jpg' },

  // Chakkars
  { code: 'CHK-001', name: 'Ground Chakkar 10', tamilName: 'தரை சக்கரம் 10', catSlug: 'chakkars', packInfo: '10 Pcs/Box', mrp: 240, sellingPrice: 48, img: '/uploads/product_chakkars.jpg' },
  { code: 'CHK-002', name: 'Ground Chakkar 25', tamilName: 'தரை சக்கரம் 25', catSlug: 'chakkars', packInfo: '25 Pcs/Box', mrp: 240, sellingPrice: 48, img: '/uploads/product_chakkars.jpg' },
  { code: 'CHK-003', name: 'Ground Chakkar Special (UV Box)', tamilName: 'தரை சக்கரம் ஸ்பெஷல்', catSlug: 'chakkars', packInfo: '10 Pcs/Box', mrp: 455, sellingPrice: 91, img: '/uploads/product_chakkars_deluxe.jpg' },
  { code: 'CHK-004', name: 'Ground Chakkar Deluxe Spinner', tamilName: 'தரை சக்கரம் டீலக்ஸ்', catSlug: 'chakkars', packInfo: '10 Pcs/Box', mrp: 790, sellingPrice: 158, img: '/uploads/product_chakkars_deluxe.jpg' },
  { code: 'CHK-005', name: '4 X 4 Fancy Wheel', tamilName: '4 X 4 வீல் சக்கரம்', catSlug: 'chakkars', packInfo: '1 Pcs/Box', mrp: 950, sellingPrice: 190, img: '/uploads/product_chakkars_deluxe.jpg' },
  { code: 'CHK-006', name: 'Pambaram Whirling Spinner', tamilName: 'பம்பரம் சுழல்', catSlug: 'chakkars', packInfo: '10 Pcs/Box', mrp: 590, sellingPrice: 118, img: '/uploads/product_chakkars.jpg' },

  // Flowerpots
  { code: 'FLP-001', name: 'Flowerpots Small (Poo Thotti)', tamilName: 'சிறிய பூச்சட்டி', catSlug: 'flowerpots', packInfo: '10 Pcs/Box', mrp: 290, sellingPrice: 58, img: '/uploads/product_flowerpots.jpg' },
  { code: 'FLP-002', name: 'Flowerpots Big', tamilName: 'பெரிய பூச்சட்டி', catSlug: 'flowerpots', packInfo: '10 Pcs/Box', mrp: 440, sellingPrice: 88, img: '/uploads/product_flowerpots.jpg' },
  { code: 'FLP-003', name: 'Flowerpots Special', tamilName: 'ஸ்பெஷல் பூச்சட்டி', catSlug: 'flowerpots', packInfo: '10 Pcs/Box', mrp: 500, sellingPrice: 100, img: '/uploads/product_flowerpots_giant.jpg' },
  { code: 'FLP-004', name: 'Flowerpots Asoka (UV Box)', tamilName: 'அசோகா பூச்சட்டி', catSlug: 'flowerpots', packInfo: '10 Pcs/Box', mrp: 725, sellingPrice: 145, img: '/uploads/product_flowerpots_asoka.jpg' },
  { code: 'FLP-005', name: 'Colour Koti Fountain', tamilName: 'கலர் கோட்டி பூச்சட்டி', catSlug: 'flowerpots', packInfo: '10 Pcs/Box', mrp: 975, sellingPrice: 195, img: '/uploads/product_flowerpots_giant.jpg' },
  { code: 'FLP-006', name: 'Tri Colour Fountain', tamilName: 'மூவர்ண பூச்சட்டி', catSlug: 'flowerpots', packInfo: '5 Pcs/Box', mrp: 1700, sellingPrice: 340, img: '/uploads/product_peacock.jpg' },
  { code: 'FLP-007', name: 'Colourful Peacock Fountain', tamilName: 'வண்ண மயில் பவுண்டன்', catSlug: 'flowerpots', packInfo: '1 Pcs/Box', mrp: 750, sellingPrice: 150, img: '/uploads/product_peacock.jpg' },

  // Sound & Bombs
  { code: 'SND-001', name: '2 3/4" Sparrow Crackers', tamilName: '2 3/4" குருவி வெடி', catSlug: 'sound-bombs', packInfo: '5 Pcs/Pocket', mrp: 45, sellingPrice: 9, img: '/uploads/product_bombs.jpg' },
  { code: 'SND-002', name: '3 1/2" Lakshmi Crackers', tamilName: '3 1/2" லட்சுமி வெடி', catSlug: 'sound-bombs', packInfo: '5 Pcs/Pocket', mrp: 80, sellingPrice: 16, img: '/uploads/product_bombs.jpg' },
  { code: 'SND-003', name: '4" Delux Lakshmi Crackers', tamilName: '4" டீலக்ஸ் லட்சுமி', catSlug: 'sound-bombs', packInfo: '5 Pcs/Pocket', mrp: 130, sellingPrice: 26, img: '/uploads/product_bombs.jpg' },
  { code: 'SND-004', name: 'Get pattas Bijili 100 Strips', tamilName: 'சிவப்பு பிஜிலி 100', catSlug: 'sound-bombs', packInfo: '1 Pocket', mrp: 200, sellingPrice: 40, img: '/uploads/product_bombs.jpg' },
  { code: 'SND-005', name: '100 Sound Crackers Wala', tamilName: '100 சவுண்ட் வாலா', catSlug: 'sound-bombs', packInfo: '1 Pcs/Box', mrp: 255, sellingPrice: 51, img: '/uploads/product_bombs.jpg' },
  { code: 'SND-006', name: '1000 Sound Garland Wala', tamilName: '1000 சவுண்ட் வாலா', catSlug: 'sound-bombs', packInfo: '1 Pcs/Box', mrp: 1000, sellingPrice: 200, img: '/uploads/product_bombs.jpg' },
  { code: 'SND-007', name: '5000 Sound Mega Wala', tamilName: '5000 சவுண்ட் வாலா', catSlug: 'sound-bombs', packInfo: '1 Pcs/Box', mrp: 5000, sellingPrice: 1000, img: '/uploads/product_bombs.jpg' },
  { code: 'SND-008', name: 'Hydro Bomb Green Thunder', tamilName: 'ஹைட்ரோ பாம் பச்சை', catSlug: 'sound-bombs', packInfo: '10 Pcs/Box', mrp: 350, sellingPrice: 70, img: '/uploads/product_bomb_hydro.jpg' },
  { code: 'SND-009', name: 'Digital Bomb High Decibel', tamilName: 'டிஜிட்டல் பாம்', catSlug: 'sound-bombs', packInfo: '10 Pcs/Box', mrp: 1250, sellingPrice: 250, img: '/uploads/product_bomb_hydro.jpg' },
  { code: 'SND-010', name: 'King of King Bomb', tamilName: 'கிங் ஆஃப் கிங் பாம்', catSlug: 'sound-bombs', packInfo: '10 Pcs/Box', mrp: 475, sellingPrice: 95, img: '/uploads/product_bomb_hydro.jpg' },

  // Sky Shots & Rockets
  { code: 'SKY-001', name: 'Rocket Bomb Deluxe', tamilName: 'ராக்கெட் பாம்', catSlug: 'skyshots', packInfo: '10 Pcs/Box', mrp: 320, sellingPrice: 64, img: '/uploads/product_rockets.jpg' },
  { code: 'SKY-002', name: 'Lunik Express Rocket', tamilName: 'லுனிக் எக்ஸ்பிரஸ் ராக்கெட்', catSlug: 'skyshots', packInfo: '10 Pcs/Box', mrp: 570, sellingPrice: 114, img: '/uploads/product_rockets.jpg' },
  { code: 'SKY-003', name: '7 Shots Multi Sky Shells', tamilName: '7 ஷாட்ஸ் ஸ்கை வெடி', catSlug: 'skyshots', packInfo: '1 Pcs/Box', mrp: 475, sellingPrice: 95, img: '/uploads/product_skyshots.jpg' },
  { code: 'SKY-004', name: '12 Shot Rider Aerial Repeater', tamilName: '12 ஷாட்ஸ் ரைடர்', catSlug: 'skyshots', packInfo: '1 Pcs/Box', mrp: 710, sellingPrice: 142, img: '/uploads/product_skyshots.jpg' },
  { code: 'SKY-005', name: '30 Sky Shots Multi-Color Shells', tamilName: '30 ஸ்கை ஷாட்ஸ்', catSlug: 'skyshots', packInfo: '1 Pcs/Box', mrp: 2400, sellingPrice: 480, img: '/uploads/product_skyshots_box.jpg' },
  { code: 'SKY-006', name: '60 Mega Aerial Sky Shells', tamilName: '60 ஸ்கை ஷாட்ஸ்', catSlug: 'skyshots', packInfo: '1 Pcs/Box', mrp: 4800, sellingPrice: 960, img: '/uploads/product_skyshots_mega.jpg' },
  { code: 'SKY-007', name: '120 Royal Grand Sky Shells', tamilName: '120 ஸ்கை ஷாட்ஸ் மெகா', catSlug: 'skyshots', packInfo: '1 Pcs/Box', mrp: 9500, price: 1900, sellingPrice: 1900, img: '/uploads/product_skyshots_mega.jpg' },
  { code: 'SKY-008', name: '2" Fancy Aerial Pipe Sky Shot', tamilName: '2" ஏரியல் ஸ்கை ஷாட்', catSlug: 'skyshots', packInfo: '1 Pcs/Box', mrp: 450, sellingPrice: 90, img: '/uploads/product_skyshots.jpg' },
  { code: 'SKY-009', name: '3.5" Double Blast Sky Shot', tamilName: '3.5" டபுள் பிளாஸ்ட்', catSlug: 'skyshots', packInfo: '1 Pcs/Box', mrp: 3750, sellingPrice: 750, img: '/uploads/product_skyshots_box.jpg' },

  // Kids Special & Fancy
  { code: 'FNC-001', name: 'POP POP Snapper', tamilName: 'பாப் பாப் தட்டு வெடி', catSlug: 'fancy', packInfo: '1 Pcs', mrp: 50, sellingPrice: 10, img: '/uploads/product_combopack.jpg' },
  { code: 'FNC-002', name: 'Ring Cap Gun Big', tamilName: 'ரிங் கேப் துப்பாக்கி', catSlug: 'fancy', packInfo: '1 Pcs', mrp: 450, sellingPrice: 90, img: '/uploads/product_combopack.jpg' },
  { code: 'FNC-003', name: 'Kit Kat Chit Chat Novelty', tamilName: 'கிட் கேட் சிட் சாட்', catSlug: 'fancy', packInfo: '10 Pcs/Box', mrp: 105, sellingPrice: 21, img: '/uploads/product_combopack.jpg' },
  { code: 'FNC-004', name: 'Butterfly Aerial Whirler', tamilName: 'பட்டர்பிளை பறக்கும் வெடி', catSlug: 'fancy', packInfo: '10 Pcs/Box', mrp: 475, sellingPrice: 95, img: '/uploads/product_combopack.jpg' },
  { code: 'FNC-005', name: 'Helicopter Flying Fireworks', tamilName: 'ஹெலிகாப்டர் பறக்கும் வெடி', catSlug: 'fancy', packInfo: '5 Pcs/Box', mrp: 480, sellingPrice: 96, img: '/uploads/product_combopack.jpg' },
  { code: 'FNC-006', name: 'Selfie Stick Mega Sparkler', tamilName: 'செல்ஃபி ஸ்டிக் மெகா', catSlug: 'fancy', packInfo: '5 Pcs/Box', mrp: 700, sellingPrice: 140, img: '/uploads/product_sparklers_giant.jpg' },
  { code: 'FNC-007', name: 'Colour Smoke Fountains', tamilName: 'வண்ண சுமோக்', catSlug: 'fancy', packInfo: '5 Pcs/Box', mrp: 1050, sellingPrice: 210, img: '/uploads/product_flowerpots.jpg' },

  // Gift Boxes & Combos
  { code: 'GFT-001', name: 'Compact Family Festival Pack (35 Items)', tamilName: 'காம்பாக்ட் பேக் (35 பொருட்கள்)', catSlug: 'giftboxes-combos', packInfo: '35 Products Box', mrp: 15000, sellingPrice: 3000, img: '/uploads/product_grand_combo.jpg' },
  { code: 'GFT-002', name: 'Chutti Fancy Kids Box (35 Items)', tamilName: 'சுட்டி ஃபேேன்சி (35 பொருட்கள்)', catSlug: 'giftboxes-combos', packInfo: '35 Products Box', mrp: 25000, sellingPrice: 5000, img: '/uploads/product_grand_combo.jpg' },
  { code: 'GFT-003', name: 'Grand Diwali Family Bumper Pack (50 Items)', tamilName: 'பேமிலி பேக் (50 பொருட்கள்)', catSlug: 'giftboxes-combos', packInfo: '50 Products Box', mrp: 30000, sellingPrice: 6000, img: '/uploads/product_grand_combo.jpg' },
  { code: 'GFT-004', name: 'VIP Super Fancy Mega Box (40 Items)', tamilName: 'சூப்பர் பேன்ஸி (40 பொருட்கள்)', catSlug: 'giftboxes-combos', packInfo: '40 Products Box', mrp: 50000, sellingPrice: 10000, img: '/uploads/product_grand_combo.jpg' },
  { code: 'GFT-005', name: 'Bronze Gift Box (21 Items)', tamilName: 'வெண்கலம் கிப்ட் பாக்ஸ்', catSlug: 'giftboxes-combos', packInfo: '21 Products Box', mrp: 2500, sellingPrice: 500, img: '/uploads/product_combopack.jpg' },
  { code: 'GFT-006', name: 'Silver Gift Box (31 Items)', tamilName: 'வெள்ளி கிப்ட் பாக்ஸ்', catSlug: 'giftboxes-combos', packInfo: '31 Products Box', mrp: 5000, sellingPrice: 1000, img: '/uploads/product_combopack.jpg' },
  { code: 'GFT-007', name: 'Gold Gift Box (41 Items)', tamilName: 'தங்கம் கிப்ட் பாக்ஸ்', catSlug: 'giftboxes-combos', packInfo: '41 Products Box', mrp: 6250, sellingPrice: 1250, img: '/uploads/product_grand_combo.jpg' },
  { code: 'GFT-008', name: 'Platinum Gift Box (51 Items)', tamilName: 'பிளாட்டினம் கிப்ட் பாக்ஸ்', catSlug: 'giftboxes-combos', packInfo: '51 Products Box', mrp: 7500, sellingPrice: 1500, img: '/uploads/product_grand_combo.jpg' }
];

async function seedDatabase() {
  console.log('🌱 Starting Multi-Brand Database Seeding...');

  // 1. Seed Admin
  const adminCount = await Admin.countDocuments();
  if (adminCount === 0) {
    const passwordHash = await bcrypt.hash('admin123', 10);
    await Admin.create({
      username: 'admin',
      passwordHash,
      role: 'superadmin'
    });
    console.log('✅ Created Superadmin: admin / admin123');
  }

  // 2. Seed Brands
  for (const bData of SEED_BRANDS) {
    let brand = await Brand.findOne({ slug: bData.slug });
    if (!brand) {
      brand = await Brand.create(bData);
      console.log(`✅ Seeded Brand: ${brand.name} (${brand.slug})`);
    } else {
      await Brand.updateOne({ slug: bData.slug }, bData);
    }

    // 3. Seed Categories for this brand
    const catMap = {};
    for (const cData of SEED_CATEGORIES) {
      let category = await Category.findOne({ brand: brand._id, slug: cData.slug });
      if (!category) {
        category = await Category.create({
          brand: brand._id,
          name: cData.name,
          slug: cData.slug,
          displayOrder: cData.displayOrder
        });
      }
      catMap[cData.slug] = category._id;
    }

    // 4. Seed Products for this brand
    const productCount = await Product.countDocuments({ brand: brand._id });
    if (productCount === 0) {
      const brandProducts = SIVAKASI_CATALOG_TEMPLATE.map((item, idx) => ({
        brand: brand._id,
        category: catMap[item.catSlug] || Object.values(catMap)[0],
        code: `${bData.slug.substring(0, 3).toUpperCase()}-${item.code}`,
        name: `${item.name}`,
        tamilName: item.tamilName,
        description: `Direct Sivakasi wholesale genuine fireworks. Eco-friendly green cracker certified.`,
        images: [item.img],
        packInfo: item.packInfo,
        mrp: item.mrp,
        sellingPrice: item.sellingPrice,
        stock: 120,
        isActive: true,
        displayOrder: idx + 1
      }));

      await Product.insertMany(brandProducts);
      console.log(`✅ Seeded ${brandProducts.length} Products for ${brand.name}`);
    }
  }

  console.log('✨ Multi-Brand Seeding Completed Successfully!');
}

// In-Memory Fallback Store for zero-downtime offline usage
const memoryStore = {
  brands: SEED_BRANDS.map((b, i) => ({ ...b, _id: `b_${i + 1}` })),
  categories: [],
  products: [],
  orders: [],
  admins: [{
    _id: 'admin_1',
    username: 'admin',
    passwordHash: bcrypt.hashSync('admin123', 10),
    role: 'superadmin'
  }]
};

// Initialize memory store
memoryStore.brands.forEach(brand => {
  const catMap = {};
  SEED_CATEGORIES.forEach((c, idx) => {
    const catId = `cat_${brand.slug}_${c.slug}`;
    catMap[c.slug] = catId;
    memoryStore.categories.push({
      _id: catId,
      brand: brand._id,
      name: c.name,
      slug: c.slug,
      displayOrder: c.displayOrder
    });
  });

  SIVAKASI_CATALOG_TEMPLATE.forEach((item, idx) => {
    memoryStore.products.push({
      _id: `prod_${brand.slug}_${idx + 1}`,
      brand: brand._id,
      category: catMap[item.catSlug] || memoryStore.categories[0]._id,
      code: `${brand.slug.substring(0, 3).toUpperCase()}-${item.code}`,
      name: item.name,
      tamilName: item.tamilName,
      description: 'Direct Sivakasi wholesale genuine fireworks. 100% genuine green firecracker.',
      images: [item.img],
      packInfo: item.packInfo,
      mrp: item.mrp,
      sellingPrice: item.sellingPrice,
      stock: 120,
      isActive: true,
      displayOrder: idx + 1
    });
  });
});

if (require.main === module) {
  require('dotenv').config();
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/get_pattasu_multibrand';
  mongoose.connect(uri)
    .then(async () => {
      await seedDatabase();
      process.exit(0);
    })
    .catch(err => {
      console.error('Seed error:', err.message);
      process.exit(1);
    });
}

module.exports = { seedDatabase, memoryStore, SEED_BRANDS, SEED_CATEGORIES };
