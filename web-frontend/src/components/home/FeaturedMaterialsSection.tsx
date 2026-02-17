import { ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const MaterialCard = ({ title, subtitle, price, image, stats, delay }: any) => {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    navigate(`/marketplace?material=${title.toLowerCase().replace(/ /g, '-')}`);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      viewport={{ once: true }}
      className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow"
    >
      <div className="relative h-48 overflow-hidden">
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        <div className="absolute top-4 right-4 px-3 py-1 bg-cyan-600 text-white rounded-full text-sm font-bold">
          {price}
        </div>
      </div>
      
      <div className="p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">{title}</h3>
        <p className="text-gray-500 mb-4">{subtitle}</p>
        
        <div className="grid grid-cols-2 gap-3 mb-6">
          {stats.map((stat: any, index: number) => (
            <div key={index} className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-base sm:text-lg font-bold text-gray-900">{stat.value}</div>
              <div className="text-xs text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>
        
        <button 
          onClick={handleViewDetails}
          className="w-full py-3 bg-gray-100 text-gray-700 rounded-lg font-bold hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
        >
          View Market Details
          <ChevronRight size={16} />
        </button>
      </div>
    </motion.div>
  );
};

const FeaturedMaterialsSection = () => {
  const materials = [
    {
      title: "Used Cooking Oil",
      subtitle: "Transforms to Biodiesel",
      price: "Rwf 800-1,200 per liter",
      image: "https://iamhomesteader.com/wp-content/uploads/2022/05/oil-1.jpg",
      stats: [
        { label: "Biodiesel Potential", value: "90%" },
        { label: "Carbon Reduction", value: "85%" }
      ]
    },
    {
      title: "Glass Bottles",
      subtitle: "Infinite Recycling Value",
      price: "Rwf 150-300 per kg",
      image: "https://www.glassonline.com/wp-content/uploads/2021/08/GreenGlass-01.jpg",
      stats: [
        { label: "Recyclable", value: "100%" },
        { label: "Energy Saved", value: "30%" }
      ]
    },
    {
      title: "Paper & Cardboard",
      subtitle: "Sustainable Packaging",
      price: "Rwf 50-150 per kg",
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQeGAzOgMStWD9RTDxw2IzxADu7_vdetnwDaA&s",
      stats: [
        { label: "Water Saved", value: "60%" },
        { label: "Trees Saved", value: "17" }
      ]
    }
  ];

  return (
    <section className="py-16 sm:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12 sm:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">Featured Materials</h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
            High-value recyclables that generate sustainable revenue
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {materials.map((material, index) => (
            <MaterialCard key={index} {...material} delay={index * 0.1} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedMaterialsSection;
