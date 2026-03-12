
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { useLanguage } from '@/context/language-context';
import { calculateBMIAction } from '@/app/actions';
import { Loader2, Calculator, Info, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MALE_AVATAR_SVG, FEMALE_AVATAR_SVG } from '@/lib/constants';

type UnitSystem = 'metric' | 'imperial';
type Gender = 'male' | 'female';

export function BMICalculator() {
    const { t, locale } = useLanguage();
    const [unitSystem, setUnitSystem] = useState<UnitSystem>('metric');
    const [gender, setGender] = useState<Gender>('male');
    const [age, setAge] = useState(25);
    const [weight, setWeight] = useState(unitSystem === 'metric' ? 70 : 154);
    const [height, setHeight] = useState(unitSystem === 'metric' ? 170 : 67);
    const [isCalculating, setIsCalculating] = useState(false);
    const [result, setResult] = useState<{ bmi: number; status: string; indications: string } | null>(null);

    const handleCalculate = async () => {
        setIsCalculating(true);
        let weightKg = weight;
        let heightCm = height;

        if (unitSystem === 'imperial') {
            weightKg = weight * 0.453592;
            heightCm = height * 2.54;
        }

        const bmiValue = weightKg / ((heightCm / 100) ** 2);
        
        const actionResult = await calculateBMIAction(bmiValue, age, gender, locale);
        
        if (actionResult.data) {
            setResult({
                bmi: bmiValue,
                status: actionResult.data.status,
                indications: actionResult.data.medicalIndications
            });
        }
        setIsCalculating(false);
    };

    const toggleUnits = (system: UnitSystem) => {
        if (system === unitSystem) return;
        setUnitSystem(system);
        if (system === 'imperial') {
            setWeight(Math.round(weight * 2.20462));
            setHeight(Math.round(height / 2.54));
        } else {
            setWeight(Math.round(weight * 0.453592));
            setHeight(Math.round(height * 2.54));
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 space-y-6">
                <Card className="border-none shadow-xl bg-card">
                    <CardHeader className="bg-primary/5 pb-8">
                        <div className="flex justify-between items-center">
                            <CardTitle className="text-2xl font-headline flex items-center gap-2">
                                <Calculator className="h-6 w-6 text-primary" />
                                {t('BMIPage.title')}
                            </CardTitle>
                            <div className="flex bg-muted p-1 rounded-full">
                                <Button 
                                    variant={unitSystem === 'metric' ? 'default' : 'ghost'} 
                                    size="sm" 
                                    className="rounded-full px-4"
                                    onClick={() => toggleUnits('metric')}
                                >
                                    {locale === 'es' ? 'Métrico' : 'Metric'}
                                </Button>
                                <Button 
                                    variant={unitSystem === 'imperial' ? 'default' : 'ghost'} 
                                    size="sm" 
                                    className="rounded-full px-4"
                                    onClick={() => toggleUnits('imperial')}
                                >
                                    {locale === 'es' ? 'Inglés' : 'Imperial'}
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-8 space-y-10">
                        {/* Gender Selection */}
                        <div className="grid grid-cols-2 gap-6">
                            <div 
                                onClick={() => setGender('male')}
                                className={cn(
                                    "cursor-pointer flex flex-col items-center gap-4 p-6 rounded-2xl border-2 transition-all",
                                    gender === 'male' ? "border-primary bg-primary/5 shadow-md" : "border-transparent bg-secondary/50 hover:bg-secondary"
                                )}
                            >
                                <div className="w-24 h-24 rounded-full overflow-hidden flex items-center justify-center bg-white shadow-sm">
                                    <div className="w-full h-full" dangerouslySetInnerHTML={{ __html: MALE_AVATAR_SVG }} />
                                </div>
                                <p className={cn("font-bold uppercase tracking-wider", gender === 'male' ? "text-primary" : "text-muted-foreground")}>
                                    {locale === 'es' ? 'Masculino' : 'Male'}
                                </p>
                            </div>
                            <div 
                                onClick={() => setGender('female')}
                                className={cn(
                                    "cursor-pointer flex flex-col items-center gap-4 p-6 rounded-2xl border-2 transition-all",
                                    gender === 'female' ? "border-accent bg-accent/5 shadow-md" : "border-transparent bg-secondary/50 hover:bg-secondary"
                                )}
                            >
                                <div className="w-24 h-24 rounded-full overflow-hidden flex items-center justify-center bg-white shadow-sm">
                                    <div className="w-full h-full" dangerouslySetInnerHTML={{ __html: FEMALE_AVATAR_SVG }} />
                                </div>
                                <p className={cn("font-bold uppercase tracking-wider", gender === 'female' ? "text-accent" : "text-muted-foreground")}>
                                    {locale === 'es' ? 'Femenino' : 'Female'}
                                </p>
                            </div>
                        </div>

                        {/* Inputs Area */}
                        <div className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <Label className="text-lg font-bold uppercase tracking-wider">{locale === 'es' ? 'ESTATURA' : 'HEIGHT'}</Label>
                                        <span className="text-2xl font-black text-primary">{height} <span className="text-sm font-normal text-muted-foreground">{unitSystem === 'metric' ? 'cm' : 'in'}</span></span>
                                    </div>
                                    <Slider 
                                        value={[height]} 
                                        min={unitSystem === 'metric' ? 50 : 20} 
                                        max={unitSystem === 'metric' ? 250 : 100} 
                                        step={1} 
                                        onValueChange={([v]) => setHeight(v)}
                                        className="py-4"
                                    />
                                </div>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <Label className="text-lg font-bold uppercase tracking-wider">{locale === 'es' ? 'PESO' : 'WEIGHT'}</Label>
                                        <span className="text-2xl font-black text-primary">{weight} <span className="text-sm font-normal text-muted-foreground">{unitSystem === 'metric' ? 'kg' : 'lb'}</span></span>
                                    </div>
                                    <Slider 
                                        value={[weight]} 
                                        min={unitSystem === 'metric' ? 20 : 44} 
                                        max={unitSystem === 'metric' ? 200 : 440} 
                                        step={1} 
                                        onValueChange={([v]) => setWeight(v)}
                                        className="py-4"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col items-center space-y-4 bg-muted/30 p-6 rounded-xl">
                                <Label className="text-lg font-bold uppercase tracking-wider">{locale === 'es' ? 'EDAD' : 'AGE'}</Label>
                                <div className="flex items-center gap-6">
                                    <Button variant="outline" size="icon" className="h-12 w-12 rounded-full border-2" onClick={() => setAge(Math.max(1, age - 1))}>-</Button>
                                    <span className="text-4xl font-black text-primary w-16 text-center">{age}</span>
                                    <Button variant="outline" size="icon" className="h-12 w-12 rounded-full border-2" onClick={() => setAge(Math.min(120, age + 1))}>+</Button>
                                </div>
                            </div>
                        </div>

                        <Button 
                            className="w-full h-16 text-xl font-black bg-primary hover:bg-primary/90 rounded-2xl shadow-lg transition-all"
                            onClick={handleCalculate}
                            disabled={isCalculating}
                        >
                            {isCalculating ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : <Calculator className="mr-2 h-6 w-6" />}
                            {locale === 'es' ? 'CALCULAR IMC' : 'CALCULATE BMI'}
                        </Button>
                    </CardContent>
                </Card>

                {result && (
                    <div className="animate-in fade-in-50 slide-in-from-bottom-10 duration-700">
                        <Card className="border-2 border-primary overflow-hidden shadow-2xl">
                            <div className="bg-primary p-8 text-center text-white">
                                <p className="text-lg font-bold opacity-90 uppercase tracking-widest mb-1">
                                    {locale === 'es' ? 'Tu Resultado' : 'Your Result'}
                                </p>
                                <h3 className="text-6xl font-black mb-2">{result.bmi.toFixed(1)}</h3>
                                <div className="inline-block px-6 py-2 bg-white/20 rounded-full font-black text-xl backdrop-blur-sm">
                                    {result.status}
                                </div>
                            </div>
                            <CardContent className="p-8 space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-primary/10 rounded-xl text-primary shrink-0">
                                        <CheckCircle2 className="h-6 w-6" />
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="font-bold text-xl text-foreground">
                                            {locale === 'es' ? 'Indicaciones Médicas' : 'Medical Indications'}
                                        </h4>
                                        <p className="text-muted-foreground leading-relaxed text-lg italic">
                                            "{result.indications}"
                                        </p>
                                    </div>
                                </div>
                                <div className="p-4 bg-muted/50 rounded-xl flex items-start gap-3 border border-border/50">
                                    <Info className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                                    <p className="text-xs text-muted-foreground">
                                        {locale === 'es' 
                                            ? 'Esta información es proporcionada por nuestro agente experto en antropología nutricional de NutriM&M basado en estándares del IMSS. Consulte siempre a un profesional de la salud.'
                                            : 'This information is provided by our NutriM&M nutritional anthropology expert based on IMSS standards. Always consult a health professional.'}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>

            <div className="space-y-6">
                <Card className="bg-secondary/20 border-none shadow-none">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <Info className="h-5 w-5 text-primary" />
                            {locale === 'es' ? '¿Cómo se mide el IMC?' : 'How is BMI measured?'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            {locale === 'es' 
                                ? 'El Índice de Masa Corporal (IMC) es un número que se calcula con base en el peso y la estatura de la persona.'
                                : 'The Body Mass Index (BMI) is a number calculated based on a person\'s weight and height.'}
                        </p>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            {locale === 'es'
                                ? 'De acuerdo con el IMSS, el IMC es un indicador confiable para identificar categorías de peso que pueden llevar a problemas de salud.'
                                : 'According to IMSS, BMI is a reliable indicator to identify weight categories that can lead to health problems.'}
                        </p>
                        
                        <div className="mt-8 pt-6 border-t border-border">
                            <h4 className="font-bold mb-4 text-primary uppercase text-xs tracking-widest">{t('BMIPage.referenceTitle')}</h4>
                            <div className="space-y-3">
                                {[
                                    { range: '< 18.5', label: locale === 'es' ? 'Bajo peso' : 'Underweight', color: 'bg-blue-400' },
                                    { range: '18.5 - 24.9', label: locale === 'es' ? 'Normal' : 'Normal', color: 'bg-green-500' },
                                    { range: '25.0 - 29.9', label: locale === 'es' ? 'Sobrepeso' : 'Overweight', color: 'bg-yellow-500' },
                                    { range: '>= 30.0', label: locale === 'es' ? 'Obesidad' : 'Obesity', color: 'bg-red-500' },
                                ].map((item) => (
                                    <div key={item.label} className="flex items-center justify-between text-sm p-3 rounded-lg bg-white shadow-sm border border-border/50">
                                        <div className="flex items-center gap-2">
                                            <div className={cn("w-3 h-3 rounded-full", item.color)} />
                                            <span className="font-medium">{item.label}</span>
                                        </div>
                                        <span className="font-black text-primary/80">{item.range}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
