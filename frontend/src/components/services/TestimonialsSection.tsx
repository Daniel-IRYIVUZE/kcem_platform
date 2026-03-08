// components/services/TestimonialsSection.tsx
import { useState } from 'react';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: 'Jean Pierre',
    role: 'Operations Manager',
    company: 'Hotel des Mille Collines',
    type: 'business',
    content: 'EcoTrade transformed our waste management. We went from paying RWF 50,000 monthly to earning RWF 30,000. The platform is incredibly easy to use.',
    rating: 5,
    image: '/images/default-avatar.svg',
    metrics: {
      savings: 'RWF 80k/year',
      diversion: '85%'
    }
  },
  {
    id: 2,
    name: 'Agathe Uwase',
    role: 'Sustainability Director',
    company: 'Kigali Marriott Hotel',
    type: 'business',
    content: 'The real-time tracking and instant payments have revolutionized how we handle our recycling program. Our Green Score improved by 40%.',
    rating: 5,
    image: '/images/default-avatar.svg',
    metrics: {
      savings: 'RWF 120k/year',
      diversion: '92%'
    }
  },
  {
    id: 3,
    name: 'Mucyo Kagame',
    role: 'General Manager',
    company: 'Kigali Serena Hotel',
    type: 'business',
    content: 'Our Green Score improved dramatically, and we now have verifiable data for our sustainability reports. Highly recommended.',
    rating: 5,
    image: '/images/default-avatar.svg',
    metrics: {
      savings: 'RWF 60k/year',
      diversion: '78%'
    }
  },
  {
    id: 4,
    name: 'Marie Claire',
    role: 'Operations Lead',
    company: 'Certified EcoTrade Recycler',
    type: 'recycler',
    content: 'The supply pipeline dashboard gives us real-time visibility into available materials. Route optimization saved us 40% on fuel costs.',
    rating: 5,
    image: '/images/default-avatar.svg',
    metrics: {
      savings: '40% fuel',
      volume: '0.1T/month'
    }
  },
  {
    id: 5,
    name: 'Jean Bosco',
    role: 'Driver',
    company: 'EcoTrade',
    type: 'driver',
    content: 'I earn RWF 15,000 daily on average. The offline navigation works perfectly even in areas with poor network. Best decision I made.',
    rating: 5,
    image: '/images/default-avatar.svg',
    metrics: {
      earnings: 'RWF 15k/day',
      trips: '500+ completed'
    }
  }
];

const TestimonialsSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [filter, setFilter] = useState('all');

  const filteredTestimonials = filter === 'all' 
    ? testimonials 
    : testimonials.filter(t => t.type === filter);

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % filteredTestimonials.length);
  };

  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 + filteredTestimonials.length) % filteredTestimonials.length);
  };

  const currentTestimonial = filteredTestimonials[currentIndex];

  if (!currentTestimonial) return null;

  return (
    <section className="py-20 bg-white dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            What Our <span className="text-cyan-600">Clients Say</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Real stories from businesses, recyclers, and drivers using EcoTrade
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          <button
            onClick={() => {
              setFilter('all');
              setCurrentIndex(0);
            }}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-cyan-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => {
              setFilter('business');
              setCurrentIndex(0);
            }}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === 'business'
                ? 'bg-cyan-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
            }`}
          >
            Businesses
          </button>
          <button
            onClick={() => {
              setFilter('recycler');
              setCurrentIndex(0);
            }}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === 'recycler'
                ? 'bg-cyan-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
            }`}
          >
            Recyclers
          </button>
          <button
            onClick={() => {
              setFilter('driver');
              setCurrentIndex(0);
            }}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === 'driver'
                ? 'bg-cyan-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
            }`}
          >
            Drivers
          </button>
        </div>

        {/* Testimonial Card */}
        <div className="relative">
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-3xl shadow-xl p-8 lg:p-12">
            <Quote className="w-12 h-12 text-cyan-600/20 mb-6" />
            
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left Column - Content */}
              <div className="lg:col-span-2">
                <p className="text-xl text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                  "{currentTestimonial.content}"
                </p>

                {/* Rating */}
                <div className="flex items-center mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < currentTestimonial.rating
                          ? 'fill-yellow-700 text-yellow-700'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>

                {/* Author Info */}
                <div>
                  <p className="font-bold text-gray-900 dark:text-white">{currentTestimonial.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {currentTestimonial.role}, {currentTestimonial.company}
                  </p>
                </div>
              </div>

              {/* Right Column - Metrics */}
              <div className="bg-cyan-50 dark:bg-cyan-900/20 rounded-2xl p-6">
                <h4 className="font-semibold text-cyan-800 dark:text-cyan-300 mb-4">Key Results</h4>
                <div className="space-y-4">
                  {Object.entries(currentTestimonial.metrics).map(([key, value]) => (
                    <div key={key}>
                      <p className="text-sm text-cyan-600 capitalize">{key}</p>
                      <p className="text-2xl font-bold text-cyan-800 dark:text-cyan-300">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          {filteredTestimonials.length > 1 && (
            <>
              <button
                onClick={prev}
                className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 lg:-translate-x-6 bg-white dark:bg-gray-900 rounded-full p-3 shadow-lg hover:shadow-xl transition-shadow"
              >
                <ChevronLeft className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </button>
              <button
                onClick={next}
                className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 lg:translate-x-6 bg-white dark:bg-gray-900 rounded-full p-3 shadow-lg hover:shadow-xl transition-shadow"
              >
                <ChevronRight className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </button>
            </>
          )}
        </div>

        {/* Dots Indicator */}
        {filteredTestimonials.length > 1 && (
          <div className="flex justify-center mt-8 space-x-2">
            {filteredTestimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex ? 'w-8 bg-cyan-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default TestimonialsSection;