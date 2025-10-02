import connectToDatabase from '../src/lib/mongodb';
import BrandModel from '../src/models/Brand';
import SocialProfileModel from '../src/models/SocialProfile';

async function seedBrands() {
  try {
    console.log('🚀 Starting brand seeding...');

    await connectToDatabase();
    console.log('✅ Connected to MongoDB');

    // Clear existing brands and profiles
    await BrandModel.deleteMany({});
    await SocialProfileModel.deleteMany({});
    console.log('🗑️  Cleared existing brands and profiles');

    // Create rohanbatrain (Professional) brand
    const professionalBrand = await BrandModel.create({
      name: 'rohanbatrain',
      displayName: 'Rohan Batra - Professional',
      slug: 'rohanbatrain',
      description: 'Professional portfolio and technical content',
      type: 'professional',
      visibility: 'public',
      isPrimary: true,
      isActive: true,
      order: 0,
      theme: {
        primaryColor: '#3B82F6',
        secondaryColor: '#8B5CF6',
        icon: '💼',
      },
    });
    console.log('✅ Created professional brand:', professionalBrand.name);

    // Add social profiles for rohanbatrain
    const professionalProfiles = await SocialProfileModel.create([
      {
        brandId: professionalBrand._id,
        platform: 'github',
        username: 'rohanbatrain',
        profileUrl: 'https://github.com/rohanbatrain',
        isActive: true,
        visibility: 'public',
        order: 0,
      },
      {
        brandId: professionalBrand._id,
        platform: 'linkedin',
        username: 'rohan-batra',
        profileUrl: 'https://linkedin.com/in/rohan-batra',
        isActive: true,
        visibility: 'public',
        order: 1,
      },
      {
        brandId: professionalBrand._id,
        platform: 'twitter',
        username: 'rohanbatrain',
        profileUrl: 'https://twitter.com/rohanbatrain',
        isActive: true,
        visibility: 'public',
        order: 2,
      },
      {
        brandId: professionalBrand._id,
        platform: 'instagram',
        username: 'rohanbatrain',
        profileUrl: 'https://instagram.com/rohanbatrain',
        isActive: true,
        visibility: 'public',
        order: 3,
      },
      {
        brandId: professionalBrand._id,
        platform: 'email',
        username: 'hello',
        profileUrl: 'mailto:hello@rohanbatra.dev',
        displayName: 'Email',
        isActive: true,
        visibility: 'public',
        order: 4,
      },
    ]);
    console.log(`✅ Created ${professionalProfiles.length} profiles for ${professionalBrand.name}`);

    // Create rohanbatrain_lens (Creative/Photography) brand
    const creativeBrand = await BrandModel.create({
      name: 'rohanbatrain_lens',
      displayName: 'Rohan Batra - Photography',
      slug: 'rohanbatrain-lens',
      description: 'Photography and creative visual content',
      type: 'creative',
      visibility: 'public',
      isPrimary: false,
      isActive: true,
      order: 1,
      theme: {
        primaryColor: '#E4405F',
        secondaryColor: '#FCAF45',
        icon: '📸',
      },
    });
    console.log('✅ Created creative brand:', creativeBrand.name);

    // Add Instagram profile for rohanbatrain_lens
    const creativeProfiles = await SocialProfileModel.create([
      {
        brandId: creativeBrand._id,
        platform: 'instagram',
        username: 'rohanbatrain_lens',
        profileUrl: 'https://instagram.com/rohanbatrain_lens',
        description: 'Photography and visual storytelling',
        isActive: true,
        visibility: 'public',
        order: 0,
      },
    ]);
    console.log(`✅ Created ${creativeProfiles.length} profiles for ${creativeBrand.name}`);

    // Summary
    const totalBrands = await BrandModel.countDocuments();
    const totalProfiles = await SocialProfileModel.countDocuments();

    console.log('\n📊 Seeding Summary:');
    console.log(`   Total Brands: ${totalBrands}`);
    console.log(`   Total Profiles: ${totalProfiles}`);
    console.log('\n🎉 Seeding completed successfully!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding brands:', error);
    process.exit(1);
  }
}

// Run the seed function
seedBrands();
