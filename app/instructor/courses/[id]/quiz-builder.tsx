/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Trash2,
  Save,
  Loader2,
  CircleHelp,
  CheckCircle2,
  Trophy,
  GripVertical,
} from "lucide-react";
import { toast } from "sonner";

import type {
  Quiz,
  QuizQuestion,
  QuizReward,
  QuizQuestionType,
} from "@/types/quiz";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface QuizBuilderProps {
  courseId: string;
  quizId: string;
  onQuizUpdate?: (quiz: Quiz) => void;
}

const QUESTION_TYPES: { value: QuizQuestionType; label: string }[] = [
  { value: "multiple_choice", label: "Multiple Choice" },
  { value: "true_false", label: "True / False" },
];

export function QuizBuilder({
  courseId,
  quizId,
  onQuizUpdate,
}: QuizBuilderProps) {
  const [, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [, setRewards] = useState<QuizReward[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(
    null,
  );

  // Quiz settings form
  const [quizTitle, setQuizTitle] = useState("");
  const [quizDescription, setQuizDescription] = useState("");
  const [passingScore, setPassingScore] = useState("70");
  const [timeLimit, setTimeLimit] = useState("");

  // Reward form
  const [rewardPoints, setRewardPoints] = useState<Record<number, string>>({
    1: "15",
    2: "10",
    3: "5",
    4: "2",
  });

  // Fetch quiz data
  const fetchQuiz = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/courses/${courseId}/quizzes/${quizId}`);
      if (!res.ok) throw new Error("Failed to fetch quiz");
      const data = await res.json();
      setQuiz(data.quiz);
      setQuestions(data.questions || []);
      setRewards(data.rewards || []);
      setQuizTitle(data.quiz.title);
      setQuizDescription(data.quiz.description || "");
      setPassingScore(data.quiz.passing_score?.toString() || "70");
      setTimeLimit(data.quiz.time_limit_minutes?.toString() || "");

      // Map rewards
      const rewardMap: Record<number, string> = {
        1: "15",
        2: "10",
        3: "5",
        4: "2",
      };
      (data.rewards || []).forEach((r: QuizReward) => {
        rewardMap[r.attempt_number] = r.points_awarded?.toString() || "0";
      });
      setRewardPoints(rewardMap);

      if (data.questions?.length > 0 && !selectedQuestionId) {
        setSelectedQuestionId(data.questions[0].id);
      }
    } catch {
      toast.error("Failed to load quiz");
    } finally {
      setLoading(false);
    }
  }, [courseId, quizId, selectedQuestionId]);

  useEffect(() => {
    fetchQuiz();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, quizId]);

  // Save quiz settings
  const handleSaveQuiz = useCallback(async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/courses/${courseId}/quizzes/${quizId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: quizTitle.trim(),
          description: quizDescription.trim() || null,
          passing_score: parseInt(passingScore) || 70,
          time_limit_minutes: timeLimit ? parseInt(timeLimit) : null,
        }),
      });

      if (!res.ok) throw new Error("Failed to save quiz");
      const data = await res.json();
      setQuiz(data.quiz);
      onQuizUpdate?.(data.quiz);

      // Save rewards
      const rewardsData = Object.entries(rewardPoints).map(
        ([attempt, points]) => ({
          attempt_number: parseInt(attempt),
          points: parseInt(points) || 0,
        }),
      );

      await fetch(`/api/courses/${courseId}/quizzes/${quizId}/rewards`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rewards: rewardsData }),
      });

      toast.success("Quiz saved!");
    } catch {
      toast.error("Failed to save quiz");
    } finally {
      setSaving(false);
    }
  }, [
    courseId,
    quizId,
    quizTitle,
    quizDescription,
    passingScore,
    timeLimit,
    rewardPoints,
    onQuizUpdate,
  ]);

  // Add question
  const handleAddQuestion = useCallback(
    async (type: QuizQuestionType) => {
      try {
        const defaultOptions =
          type === "true_false"
            ? [
                { label: "True", value: "true" },
                { label: "False", value: "false" },
              ]
            : type === "multiple_choice"
              ? [
                  { label: "Option A", value: "a" },
                  { label: "Option B", value: "b" },
                  { label: "Option C", value: "c" },
                  { label: "Option D", value: "d" },
                ]
              : null;

        const res = await fetch(
          `/api/courses/${courseId}/quizzes/${quizId}/questions`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              question_text: "New question",
              question_type: type,
              options: defaultOptions,
              correct_answer:
                type === "true_false"
                  ? "true"
                  : type === "multiple_choice"
                    ? "a"
                    : "",
              points: 1,
              explanation: "",
            }),
          },
        );

        if (!res.ok) throw new Error("Failed to add question");
        const data = await res.json();
        setQuestions((prev) => [...prev, data.question]);
        setSelectedQuestionId(data.question.id);
        toast.success("Question added");
      } catch {
        toast.error("Failed to add question");
      }
    },
    [courseId, quizId],
  );

  // Save question
  const handleSaveQuestion = useCallback(
    async (question: QuizQuestion) => {
      try {
        const res = await fetch(
          `/api/courses/${courseId}/quizzes/${quizId}/questions/${question.id}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              question_text: question.question_text,
              question_type: question.question_type,
              options: question.options,
              correct_answer: question.correct_answer,
              points: question.points,
              explanation: question.explanation,
            }),
          },
        );

        if (!res.ok) throw new Error("Failed to save");
        const data = await res.json();
        setQuestions((prev) =>
          prev.map((q) => (q.id === data.question.id ? data.question : q)),
        );
        toast.success("Question saved");
      } catch {
        toast.error("Failed to save question");
      }
    },
    [courseId, quizId],
  );

  // Delete question
  const handleDeleteQuestion = useCallback(
    async (questionId: string) => {
      try {
        const res = await fetch(
          `/api/courses/${courseId}/quizzes/${quizId}/questions/${questionId}`,
          {
            method: "DELETE",
          },
        );

        if (!res.ok) throw new Error("Failed to delete");
        setQuestions((prev) => prev.filter((q) => q.id !== questionId));
        if (selectedQuestionId === questionId) {
          setSelectedQuestionId(
            questions.find((q) => q.id !== questionId)?.id || null,
          );
        }
        toast.success("Question deleted");
      } catch {
        toast.error("Failed to delete question");
      }
    },
    [courseId, quizId, selectedQuestionId, questions],
  );

  const selectedQuestion = questions.find((q) => q.id === selectedQuestionId);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Left Panel: Questions List + Rewards */}
      <div className="space-y-4">
        {/* Quiz Settings */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Quiz Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Title</Label>
              <Input
                value={quizTitle}
                onChange={(e) => setQuizTitle(e.target.value)}
                placeholder="Quiz title"
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Description</Label>
              <Textarea
                value={quizDescription}
                onChange={(e) => setQuizDescription(e.target.value)}
                placeholder="Quiz description..."
                className="min-h-16 text-sm resize-y"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <Label className="text-xs">Pass Score (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={passingScore}
                  onChange={(e) => setPassingScore(e.target.value)}
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Time Limit (min)</Label>
                <Input
                  type="number"
                  min="0"
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(e.target.value)}
                  placeholder="No limit"
                  className="h-8 text-sm"
                />
              </div>
            </div>
            <Button
              size="sm"
              onClick={handleSaveQuiz}
              disabled={saving}
              className="w-full gap-1.5"
            >
              {saving ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Save className="h-3 w-3" />
              )}
              Save Settings
            </Button>
          </CardContent>
        </Card>

        {/* Questions List */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                Questions ({questions.length})
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-1 p-2">
            {questions.map((q, idx) => (
              <button
                key={q.id}
                onClick={() => setSelectedQuestionId(q.id)}
                className={cn(
                  "w-full flex items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors",
                  selectedQuestionId === q.id
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-muted",
                )}
              >
                <GripVertical className="h-3 w-3 text-muted-foreground shrink-0" />
                <span className="font-medium shrink-0 text-xs">{idx + 1}.</span>
                <span className="truncate flex-1">{q.question_text}</span>
                <Badge variant="secondary" className="text-[10px] shrink-0">
                  {q.question_type === "multiple_choice"
                    ? "MC"
                    : q.question_type === "true_false"
                      ? "T/F"
                      : "SA"}
                </Badge>
              </button>
            ))}
            <Separator className="my-2" />
            <div className="flex gap-1.5 p-1">
              {QUESTION_TYPES.map((type) => (
                <Button
                  key={type.value}
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddQuestion(type.value)}
                  className="flex-1 text-xs h-7 gap-1"
                >
                  <Plus className="h-3 w-3" />
                  {type.value === "multiple_choice"
                    ? "MC"
                    : type.value === "true_false"
                      ? "T/F"
                      : "SA"}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Rewards */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Trophy className="h-4 w-4" />
              Rewards
            </CardTitle>
            <CardDescription className="text-xs">
              Points earned per attempt
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {[1, 2, 3, 4].map((attempt) => (
              <div key={attempt} className="flex items-center gap-2">
                <Label className="text-xs w-20 shrink-0">
                  Attempt {attempt}
                </Label>
                <Input
                  type="number"
                  min="0"
                  value={rewardPoints[attempt] || "0"}
                  onChange={(e) =>
                    setRewardPoints((prev) => ({
                      ...prev,
                      [attempt]: e.target.value,
                    }))
                  }
                  className="h-7 text-sm"
                />
                <span className="text-xs text-muted-foreground shrink-0">
                  pts
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Right Panel: Question Editor */}
      <div className="lg:col-span-2">
        {selectedQuestion ? (
          <QuestionEditor
            question={selectedQuestion}
            onSave={handleSaveQuestion}
            onDelete={handleDeleteQuestion}
          />
        ) : (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <CircleHelp className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-1">
                No question selected
              </h3>
              <p className="text-sm text-muted-foreground">
                Select a question from the list or add a new one
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// ─── Question Editor Component ────────────────────────────────────────────────

function QuestionEditor({
  question,
  onSave,
  onDelete,
}: {
  question: QuizQuestion;
  onSave: (q: QuizQuestion) => void;
  onDelete: (id: string) => void;
}) {
  const [qText, setQText] = useState(question.question_text);
  const [qType, setQType] = useState(question.question_type);
  const [options, setOptions] = useState(question.options || []);
  const [correctAnswer, setCorrectAnswer] = useState(question.correct_answer);
  const [points, setPoints] = useState(question.points.toString());
  const [explanation, setExplanation] = useState(question.explanation || "");
  const [saving, setSaving] = useState(false);

  // Reset when question changes
  useEffect(() => {
    setQText(question.question_text);
    setQType(question.question_type);
    setOptions(question.options || []);
    setCorrectAnswer(question.correct_answer);
    setPoints(question.points.toString());
    setExplanation(question.explanation || "");
    setSaving(false);
  }, [question]);

  const handleSave = async () => {
    setSaving(true);
    await onSave({
      ...question,
      question_text: qText,
      question_type: qType,
      options: options,
      correct_answer: correctAnswer,
      points: parseInt(points) || 1,
      explanation: explanation || null,
    });
    setSaving(false);
  };

  const updateOption = (idx: number, field: "label" | "value", val: string) => {
    setOptions((prev) =>
      prev.map((o, i) => (i === idx ? { ...o, [field]: val } : o)),
    );
  };

  const addOption = () => {
    const nextLetter = String.fromCharCode(97 + options.length); // a, b, c...
    setOptions((prev) => [
      ...prev,
      { label: `Option ${nextLetter.toUpperCase()}`, value: nextLetter },
    ]);
  };

  const removeOption = (idx: number) => {
    setOptions((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Edit Question</CardTitle>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleSave}
              disabled={saving}
              className="gap-1.5"
            >
              {saving ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Save className="h-3 w-3" />
              )}
              Save
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Question?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDelete(question.id)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Question Text */}
        <div className="space-y-2">
          <Label>Question Text</Label>
          <Textarea
            value={qText}
            onChange={(e) => setQText(e.target.value)}
            placeholder="Enter your question..."
            className="min-h-20 resize-y"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Type */}
          <div className="space-y-2">
            <Label>Question Type</Label>
            <Select
              value={qType}
              onValueChange={(v) => {
                setQType(v as QuizQuestionType);
                if (v === "true_false") {
                  setOptions([
                    { label: "True", value: "true" },
                    { label: "False", value: "false" },
                  ]);
                  setCorrectAnswer("true");
                } else if (v === "multiple_choice" && options.length === 0) {
                  setOptions([
                    { label: "Option A", value: "a" },
                    { label: "Option B", value: "b" },
                    { label: "Option C", value: "c" },
                    { label: "Option D", value: "d" },
                  ]);
                  setCorrectAnswer("a");
                }
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {QUESTION_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Points */}
          <div className="space-y-2">
            <Label>Points</Label>
            <Input
              type="number"
              min="1"
              value={points}
              onChange={(e) => setPoints(e.target.value)}
            />
          </div>
        </div>

        {/* Options for MC / T-F */}
        <div className="space-y-3">
          <Label>Answer Options</Label>
          {options.map((opt, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <button
                onClick={() => setCorrectAnswer(opt.value)}
                className={cn(
                  "shrink-0 rounded-full p-1 transition-colors",
                  correctAnswer === opt.value
                    ? "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/40"
                    : "text-muted-foreground hover:text-foreground",
                )}
                title="Mark as correct"
              >
                <CheckCircle2 className="h-4 w-4" />
              </button>
              <Input
                value={opt.label}
                onChange={(e) => updateOption(idx, "label", e.target.value)}
                placeholder={`Option ${idx + 1}`}
                className="flex-1"
              />
              {qType === "multiple_choice" && options.length > 2 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeOption(idx)}
                  className="text-destructive hover:text-destructive h-8 w-8 p-0"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
          ))}
          {qType === "multiple_choice" && options.length < 6 && (
            <Button
              variant="outline"
              size="sm"
              onClick={addOption}
              className="gap-1.5"
            >
              <Plus className="h-3 w-3" />
              Add Option
            </Button>
          )}
        </div>

        {/* Explanation */}
        <div className="space-y-2">
          <Label>Explanation (shown after answering)</Label>
          <Textarea
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            placeholder="Explain the correct answer..."
            className="min-h-16 resize-y"
          />
        </div>
      </CardContent>
    </Card>
  );
}
