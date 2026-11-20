import { CalendarSection } from './components/CalendarSection';
import { Cover } from './components/Cover';
import { Footer } from './components/Footer';
import { Greeting } from './components/Greeting';
import { Timeline } from './components/Timeline';
import { ToastContainer } from './components/ToastContainer';

export function App() {
  return (
    <div className="min-h-dvh w-full bg-backdrop flex justify-center">
      <main className="w-full max-w-md min-h-dvh bg-ivory text-ink shadow-[0_0_40px_rgba(35,33,31,0.06)] overflow-x-hidden relative flex flex-col">
        <Cover />
        <Greeting />
        <CalendarSection />
        <Timeline />

        {/* Phase 3 예정: Gallery, Location, Account */}
        {/* Phase 4 예정: Guestbook */}

        <Footer />
        <ToastContainer />
      </main>
    </div>
  );
}

export default App;
