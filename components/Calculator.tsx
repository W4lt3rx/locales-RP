
import React, { useState, useEffect } from 'react';
import { Calculator as CalculatorIcon, X, Plus, Minus, Trash2, ShoppingCart } from 'lucide-react';
import { Product, CartItem, LocaleType, User } from '../types';
import { StorageService } from '../services/storageService';
import { DiscordService } from '../services/discordService';

interface CalculatorProps {
  locale: LocaleType;
  user: User;
}

const formatMoney = (amount: number) => {
  return new Intl.NumberFormat('es-CL').format(Math.floor(amount));
};

export const Calculator: React.FC<CalculatorProps> = ({ locale, user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const prods = StorageService.getProducts(locale);
      setProducts(prods);
    }
  }, [isOpen, locale]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(p => p.id === product.id);
      if (existing) {
        return prev.map(p => p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(p => {
      if (p.id === id) {
        const newQty = p.quantity + delta;
        return newQty > 0 ? { ...p, quantity: newQty } : p;
      }
      return p;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(p => p.id !== id));
  };

  const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setIsProcessing(true);

    const saleLog = {
      id: crypto.randomUUID(),
      userId: user.id,
      username: user.username,
      locale,
      items: cart,
      total,
      timestamp: new Date().toISOString()
    };

    StorageService.addSaleLog(saleLog);
    await DiscordService.sendSaleLog(user.username, locale, cart, total);

    setCart([]);
    setIsProcessing(false);
    setIsOpen(false);
    alert('✅ Venta registrada correctamente');
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-8 right-8 w-16 h-16 rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-110 z-50 text-white
          ${locale === 'yummy' ? 'bg-pink-400 hover:bg-pink-500' : 'bg-sky-400 hover:bg-sky-500'}`}
      >
        <CalculatorIcon size={28} />
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white/95 backdrop-blur-md w-full max-w-4xl h-[85vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row modal-content border-2 border-white/50">
            
            {/* Close Button Mobile */}
            <button 
              onClick={() => setIsOpen(false)} 
              className="absolute top-4 right-4 md:hidden text-gray-500 z-10"
            >
              <X />
            </button>

            {/* Left: Product Grid */}
            <div className={`flex-1 p-6 overflow-y-auto ${locale === 'yummy' ? 'bg-pink-50/50' : 'bg-sky-50/50'}`}>
              <div className="flex justify-between items-center mb-6">
                <h2 className={`text-2xl font-bold ${locale === 'yummy' ? 'text-pink-600' : 'text-sky-600'}`}>
                  {locale === 'yummy' ? '🍦 Yummy Calculadora' : '☕ UwU Calculadora'}
                </h2>
                <button 
                  onClick={() => setIsOpen(false)} 
                  className="hidden md:block text-gray-400 hover:text-gray-600"
                >
                  <X />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4">
                {products.map(product => (
                  <div 
                    key={product.id}
                    onClick={() => addToCart(product)}
                    className="bg-white/80 p-4 rounded-xl shadow-sm hover:shadow-md cursor-pointer transition-all border border-transparent hover:border-current group"
                    style={{ borderColor: locale === 'yummy' ? '#fbcfe8' : '#bae6fd' }}
                  >
                    <div className="text-4xl mb-2 text-center group-hover:scale-110 transition-transform">
                      {product.icon}
                    </div>
                    <h3 className="font-bold text-gray-700 text-center truncate">{product.name}</h3>
                    <p className={`text-center font-bold mt-1 ${locale === 'yummy' ? 'text-pink-500' : 'text-sky-500'}`}>
                      ${formatMoney(product.price)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Cart */}
            <div className="w-full md:w-96 bg-white/60 backdrop-blur-sm flex flex-col border-l border-white/40">
              <div className="p-6 border-b border-white/40 bg-white/30">
                <h3 className="font-bold text-gray-700 flex items-center gap-2">
                  <ShoppingCart size={20} />
                  Ticket Actual
                </h3>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-50">
                    <ShoppingCart size={48} className="mb-2" />
                    <p>Carrito vacío</p>
                  </div>
                ) : (
                  cart.map(item => (
                    <div key={item.id} className="flex items-center justify-between bg-white/80 p-3 rounded-lg border border-white/50">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{item.icon}</span>
                        <div>
                          <p className="font-bold text-gray-700 text-sm">{item.name}</p>
                          <p className="text-xs text-gray-500">${formatMoney(item.price * item.quantity)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-4 text-center text-sm font-bold text-gray-700">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600"
                        >
                          <Plus size={12} />
                        </button>
                        <button 
                          onClick={() => removeFromCart(item.id)}
                          className="ml-2 text-red-400 hover:text-red-600"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-6 bg-white/40 border-t border-white/40">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-600">Total</span>
                  <span className="text-3xl font-bold text-gray-800">${formatMoney(total)}</span>
                </div>
                <button
                  onClick={handleCheckout}
                  disabled={cart.length === 0 || isProcessing}
                  className={`w-full py-4 rounded-xl font-bold text-lg text-white shadow-lg transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
                    ${locale === 'yummy' ? 'bg-green-400 hover:bg-green-500' : 'bg-green-400 hover:bg-green-500'}`}
                >
                  {isProcessing ? 'Procesando...' : '✅ Confirmar Venta'}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
