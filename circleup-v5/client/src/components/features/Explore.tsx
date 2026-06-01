import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Star, Clock, Navigation, ChevronRight, Users, Loader2, X } from 'lucide-react';
import { useStore } from '@/lib/store';
import { Avatar, Button, Card, Badge, Modal, TabBar, Spinner } from '@/components/ui';
import { api, cn } from '@/lib/api';

declare global {
  interface Window { google: any; initMap: () => void; __gmapsLoaded?: boolean; }
}

const GMAPS_KEY = (import.meta as any).env?.VITE_GOOGLE_MAPS_KEY || '';

function loadGoogleMaps(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.__gmapsLoaded || window.google?.maps) { window.__gmapsLoaded = true; resolve(); return; }
    const exist = document.getElementById('gmaps-script');
    if (exist) { exist.addEventListener('load', () => resolve()); return; }
    window.initMap = () => { window.__gmapsLoaded = true; resolve(); };
    const s = document.createElement('script');
    s.id = 'gmaps-script';
    s.src = `https://maps.googleapis.com/maps/api/js?key=${GMAPS_KEY}&libraries=places&callback=initMap`;
    s.async = true; s.defer = true;
    s.onerror = () => reject(new Error('Google Maps failed'));
    document.head.appendChild(s);
  });
}

interface Place {
  id: string; name: string; type: string; emoji: string;
  rating: number; dist: string; price: string; open: boolean;
  address: string; lat: number; lng: number; placeId: string; photoUrl?: string;
}

const TYPE_EMOJI: Record<string, string> = {
  cafe: '☕', restaurant: '🍽️', bar: '🍺', gym: '💪', park: '🌳',
  museum: '🏛️', library: '📚', movie_theater: '🎬', shopping_mall: '🛍️',
  hospital: '🏥', pharmacy: '💊', school: '🏫', default: '📍',
};

const FALLBACK_PLACES: Place[] = [
  { id: 'f1', name: 'The Coffee House', type: 'cafe', emoji: '☕', rating: 4.8, dist: '0.3 km', price: '$$', open: true, address: '12 Main Street', lat: 0, lng: 0, placeId: '' },
  { id: 'f2', name: 'Urban Grill', type: 'restaurant', emoji: '🍽️', rating: 4.5, dist: '0.6 km', price: '$$$', open: true, address: '45 Park Avenue', lat: 0, lng: 0, placeId: '' },
  { id: 'f3', name: 'Sunrise Yoga Studio', type: 'gym', emoji: '🧘', rating: 4.9, dist: '0.9 km', price: '$$', open: false, address: '8 Wellness Road', lat: 0, lng: 0, placeId: '' },
  { id: 'f4', name: 'City Bookshop', type: 'library', emoji: '📚', rating: 4.7, dist: '1.1 km', price: '$', open: true, address: '22 Library Lane', lat: 0, lng: 0, placeId: '' },
  { id: 'f5', name: 'Rooftop Bar & Lounge', type: 'bar', emoji: '🍹', rating: 4.6, dist: '1.4 km', price: '$$$', open: true, address: '100 Sky Tower', lat: 0, lng: 0, placeId: '' },
  { id: 'f6', name: 'Fresh Market', type: 'park', emoji: '🥦', rating: 4.3, dist: '0.5 km', price: '$', open: true, address: '3 Green Street', lat: 0, lng: 0, placeId: '' },
];

function FallbackMap({ places, onPlaceClick }: { places: Place[]; onPlaceClick: (p: Place) => void }) {
  const positions = [
    {l:32,t:28},{l:55,t:48},{l:72,t:28},{l:18,t:68},{l:48,t:72},{l:65,t:20}
  ];
  return (
    <div className="relative w-full h-full bg-gradient-to-br from-blue-50 to-indigo-100 overflow-hidden">
      {[...Array(8)].map((_,i) => <div key={`h${i}`} className="absolute left-0 right-0 border-t border-blue-200/40" style={{top:`${i*12.5}%`}} />)}
      {[...Array(8)].map((_,i) => <div key={`v${i}`} className="absolute top-0 bottom-0 border-l border-blue-200/40" style={{left:`${i*12.5}%`}} />)}
      <div className="absolute bg-white/60 rounded-full" style={{height:7,width:'60%',top:'44%',left:'18%',transform:'rotate(6deg)'}} />
      <div className="absolute bg-white/40 rounded-full" style={{height:5,width:'45%',top:'62%',left:'28%',transform:'rotate(-10deg)'}} />
      <div className="absolute bg-indigo-200/40 rounded-sm" style={{width:'18%',height:'12%',top:'30%',left:'35%'}} />
      {places.slice(0,6).map((p,i) => (
        <motion.button key={p.id} onClick={() => onPlaceClick(p)}
          className="absolute text-2xl filter drop-shadow-md cursor-pointer leading-none"
          style={{left:`${positions[i]?.l||50}%`,top:`${positions[i]?.t||50}%`,transform:'translate(-50%,-50%)'}}
          whileHover={{scale:1.35}} whileTap={{scale:0.9}}>
          {p.emoji}
        </motion.button>
      ))}
      <div className="absolute" style={{left:'48%',top:'53%',transform:'translate(-50%,-100%)'}}>
        <div className="w-10 h-10 rounded-full border-white shadow-xl flex items-center justify-center gradient-brand" style={{border:'3px solid white'}}>
          <Navigation className="w-4 h-4 text-white fill-white" />
        </div>
        <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-brand-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow whitespace-nowrap">You</div>
      </div>
      <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur rounded-xl px-3 py-1.5 text-xs text-gray-500 shadow">
        Add VITE_GOOGLE_MAPS_KEY in .env for live maps
      </div>
    </div>
  );
}

function GoogleMapView({ center, places, userPos, onPlaceClick }:
  { center: {lat:number;lng:number}; places: Place[]; userPos: {lat:number;lng:number}|null; onPlaceClick:(p:Place)=>void }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInst = useRef<any>(null);
  const markers = useRef<any[]>([]);

  useEffect(() => {
    if (!mapRef.current || !window.google?.maps) return;
    const map = new window.google.maps.Map(mapRef.current, {
      center, zoom: 15,
      mapTypeControl: false, streetViewControl: false, fullscreenControl: false,
      styles: [
        {elementType:'geometry',stylers:[{color:'#f8f7ff'}]},
        {featureType:'road',elementType:'geometry',stylers:[{color:'#ffffff'}]},
        {featureType:'road',elementType:'geometry.stroke',stylers:[{color:'#e0e7ff'}]},
        {featureType:'water',elementType:'geometry',stylers:[{color:'#c7d2fe'}]},
        {featureType:'landscape',elementType:'geometry',stylers:[{color:'#f3f4f8'}]},
        {featureType:'poi',elementType:'labels',stylers:[{visibility:'off'}]},
      ],
    });
    mapInst.current = map;
    if (userPos) {
      new window.google.maps.Marker({
        position: userPos, map,
        icon: { path: window.google.maps.SymbolPath.CIRCLE, scale:12, fillColor:'#6366f1', fillOpacity:1, strokeColor:'#fff', strokeWeight:3 },
        zIndex: 999,
      });
      new window.google.maps.Circle({ center:userPos, map, radius:100, fillColor:'#6366f1', fillOpacity:0.1, strokeColor:'#6366f1', strokeOpacity:0.3, strokeWeight:1 });
    }
  }, [center, userPos]);

  useEffect(() => {
    if (!mapInst.current || !window.google?.maps) return;
    markers.current.forEach(m => m.setMap(null));
    markers.current = places.filter(p => p.lat && p.lng).map(p => {
      const m = new window.google.maps.Marker({
        position: {lat:p.lat,lng:p.lng}, map:mapInst.current,
        title: p.name,
        label: {text:p.emoji, fontSize:'22px'},
        icon: {path:window.google.maps.SymbolPath.CIRCLE, scale:0, fillOpacity:0, strokeOpacity:0},
      });
      m.addListener('click', () => onPlaceClick(p));
      return m;
    });
  }, [places]);

  return <div ref={mapRef} className="w-full h-full" />;
}

export default function ExplorePage() {
  const { user, onlineFriends } = useStore();
  const [tab, setTab] = useState('places');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Place|null>(null);
  const [checkedIn, setCheckedIn] = useState<string|null>(null);
  const [places, setPlaces] = useState<Place[]>(FALLBACK_PLACES);
  const [friends, setFriends] = useState<any[]>([]);
  const [userPos, setUserPos] = useState<{lat:number;lng:number}|null>(null);
  const [center, setCenter] = useState({lat:19.076,lng:72.877});
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const [mapsError, setMapsError] = useState(!GMAPS_KEY);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      pos => { const l = {lat:pos.coords.latitude,lng:pos.coords.longitude}; setUserPos(l); setCenter(l); },
      () => {}
    );
  }, []);

  useEffect(() => {
    if (!GMAPS_KEY) return;
    loadGoogleMaps().then(() => setMapsLoaded(true)).catch(() => setMapsError(true));
  }, []);

  useEffect(() => {
    if (!mapsLoaded || !window.google?.maps?.places) return;
    const loc = userPos || center;
    setLoading(true);
    const svc = new window.google.maps.places.PlacesService(document.createElement('div'));
    svc.nearbySearch({ location: new window.google.maps.LatLng(loc.lat, loc.lng), radius:1500, type:'establishment' },
      (results: any[], status: any) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && results?.length) {
          setPlaces(results.slice(0,15).map((r:any) => ({
            id: r.place_id,
            name: r.name,
            type: r.types?.[0] || 'place',
            emoji: TYPE_EMOJI[r.types?.[0]] || TYPE_EMOJI.default,
            rating: r.rating || 0,
            dist: '',
            price: ['$','$$','$$$','$$$$'][r.price_level ?? 1] || '$$',
            open: r.opening_hours?.open_now ?? true,
            address: r.vicinity || '',
            lat: r.geometry.location.lat(),
            lng: r.geometry.location.lng(),
            placeId: r.place_id,
            photoUrl: r.photos?.[0]?.getUrl({maxWidth:400,maxHeight:200}),
          })));
        }
        setLoading(false);
      });
  }, [mapsLoaded, userPos]);

  useEffect(() => {
    api.get('/users/me/friends').then(({data}) => setFriends(data.slice(0,10))).catch(()=>{});
  }, []);

  const doCheckin = (name: string) => {
    setCheckedIn(name); setSelected(null);
    setTimeout(() => setCheckedIn(null), 5000);
  };

  const filtered = places.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-black">Explore</h2>
        <AnimatePresence>
          {checkedIn && (
            <motion.div initial={{scale:0,opacity:0}} animate={{scale:1,opacity:1}} exit={{scale:0,opacity:0}}
              className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
              <MapPin className="w-4 h-4" /> Checked in!
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Map */}
      <Card className="overflow-hidden mb-5 p-0">
        <div className="relative h-72">
          {mapsLoaded && !mapsError
            ? <GoogleMapView center={center} places={places} userPos={userPos} onPlaceClick={setSelected} />
            : <FallbackMap places={places} onPlaceClick={setSelected} />}
          <button onClick={() => { if(userPos) setCenter({...userPos}); }}
            className="absolute top-3 right-3 bg-white shadow-lg rounded-xl p-2.5 text-brand-600 hover:bg-indigo-50 transition z-10">
            <Navigation className="w-5 h-5" />
          </button>
          {loading && (
            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur rounded-xl px-3 py-1.5 flex items-center gap-2 text-xs font-semibold text-brand-600 z-10">
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Finding places...
            </div>
          )}
        </div>
      </Card>

      <div className="mb-4">
        <TabBar tabs={[{id:'places',label:'📍 Places'},{id:'friends',label:`👥 Friends (${friends.length})`}]} active={tab} onChange={setTab} />
      </div>

      {tab === 'places' && (
        <>
          <div className="relative mb-4">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input placeholder="Search places nearby..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-indigo-50 rounded-xl text-sm outline-none focus:border-brand-400 shadow-sm" />
          </div>
          {loading ? <div className="flex justify-center py-10"><Spinner /></div> : (
            <div className="space-y-3">
              {filtered.map((p,i) => (
                <motion.div key={p.id} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:i*0.03}}>
                  <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelected(p)}>
                    <div className="flex">
                      {p.photoUrl
                        ? <img src={p.photoUrl} alt={p.name} className="w-24 h-24 object-cover flex-shrink-0" />
                        : <div className="w-24 h-24 flex-shrink-0 bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center text-4xl">{p.emoji}</div>}
                      <div className="flex-1 p-4 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-0.5">
                          <div className="font-bold text-[15px] truncate">{p.name}</div>
                          <Badge color={p.open?'#10b981':'#ef4444'} className="flex-shrink-0 text-[10px] py-0.5">
                            <Clock className="w-2.5 h-2.5" />{p.open?'Open':'Closed'}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-400 capitalize">{p.type.replace(/_/g,' ')} · {p.price}</div>
                        {p.address && <div className="text-xs text-gray-400 truncate mt-0.5 flex items-center gap-1"><MapPin className="w-3 h-3 flex-shrink-0" />{p.address}</div>}
                        <div className="flex items-center justify-between mt-2">
                          {p.rating>0 && <div className="flex items-center gap-1 text-amber-500 font-bold text-sm"><Star className="w-3.5 h-3.5 fill-amber-500" />{p.rating.toFixed(1)}</div>}
                          <button className="ml-auto text-xs text-brand-600 font-bold flex items-center gap-0.5 hover:underline"
                            onClick={e => { e.stopPropagation(); doCheckin(p.name); }}>
                            Check in <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
              {!filtered.length && <Card className="text-center py-12"><div className="text-4xl mb-2">🔍</div><div className="font-bold text-gray-500">No places found</div></Card>}
            </div>
          )}
        </>
      )}

      {tab === 'friends' && (
        <div className="space-y-3">
          {friends.length===0 ? (
            <Card className="text-center py-16">
              <Users className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <div className="font-bold text-lg">No friends yet</div>
              <p className="text-gray-400 text-sm">Add friends to see them here</p>
            </Card>
          ) : friends.map((f,i) => (
            <motion.div key={f._id} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:i*0.05}}>
              <Card className="flex items-center gap-4 p-4">
                <Avatar src={f.avatar} name={f.name} size={52} online={onlineFriends.has(f._id)} />
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-[15px]">{f.name}</div>
                  <div className="text-sm text-gray-400 flex items-center gap-1"><MapPin className="w-3.5 h-3.5 flex-shrink-0" />{f.location||'Somewhere nearby'}</div>
                </div>
                <Button size="sm" variant="soft">Message</Button>
              </Card>
            </motion.div>
          ))}
          <Card className="p-5 text-center bg-indigo-50/50 border-dashed border-2 border-brand-200">
            <div className="text-4xl mb-2">📍</div>
            <div className="font-bold mb-1">Share your location</div>
            <p className="text-sm text-gray-400 mb-4">Let your circle know where you are</p>
            <Button onClick={() => navigator.geolocation?.getCurrentPosition(
              () => doCheckin('My Current Location'), () => doCheckin('Somewhere')
            )}><Navigation className="w-4 h-4" /> Share Location</Button>
          </Card>
        </div>
      )}

      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.name||''}>
        {selected && (
          <div>
            {selected.photoUrl
              ? <img src={selected.photoUrl} alt={selected.name} className="w-full h-44 object-cover rounded-2xl mb-5" />
              : <div className="text-center text-7xl mb-5 py-6 bg-indigo-50 rounded-2xl">{selected.emoji}</div>}
            <div className="grid grid-cols-2 gap-3 mb-5">
              {[['Type',selected.type.replace(/_/g,' ')],['Rating',selected.rating>0?`⭐ ${selected.rating.toFixed(1)}`:'N/A'],
                ['Status',selected.open?'🟢 Open now':'🔴 Closed'],['Price',selected.price]].map(([k,v]) => (
                <div key={k} className="bg-indigo-50 rounded-xl p-3">
                  <div className="text-xs text-gray-400 font-semibold mb-0.5">{k}</div>
                  <div className="font-bold text-sm capitalize">{v}</div>
                </div>
              ))}
            </div>
            {selected.address && (
              <div className="flex items-start gap-2 text-sm text-gray-500 mb-5 bg-gray-50 p-3 rounded-xl">
                <MapPin className="w-4 h-4 text-brand-400 flex-shrink-0 mt-0.5" /><span>{selected.address}</span>
              </div>
            )}
            {selected.placeId && GMAPS_KEY && (
              <a href={`https://www.google.com/maps/place/?q=place_id:${selected.placeId}`}
                target="_blank" rel="noopener noreferrer"
                className="block text-center text-sm text-brand-600 font-semibold hover:underline mb-4">
                View on Google Maps →
              </a>
            )}
            <div className="flex gap-3">
              <Button full onClick={() => doCheckin(selected.name)}><MapPin className="w-4 h-4" /> Check In</Button>
              <Button full variant="soft" onClick={() => navigator.clipboard?.writeText(selected.address)}>🔗 Copy Address</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
